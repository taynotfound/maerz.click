const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../handlers/auth.handler");
const { LinkSplashPages, Link } = require("../models");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Get splash page for link
router.get("/:linkId", asyncHandler(auth.jwt), asyncHandler(async (req, res) => {
  const link = await Link.query()
    .findById(req.params.linkId)
    .where("user_id", req.user.id);

  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  const splashPage = await LinkSplashPages.query()
    .findOne("link_id", req.params.linkId);

  res.json({ splashPage });
}));

// Create/Update splash page for link
router.post("/:linkId",
  asyncHandler(auth.jwt),
  [
    body("template_type").isIn(["minimal", "promotional", "warning", "branded"]),
    body("branding_config").optional().isObject(),
    body("custom_html").optional(),
    body("custom_css").optional(),
    body("is_active").optional().isBoolean(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const link = await Link.query()
      .findById(req.params.linkId)
      .where("user_id", req.user.id);

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    const existingSplash = await LinkSplashPages.query()
      .findOne("link_id", req.params.linkId);

    let splashPage;
    if (existingSplash) {
      splashPage = await LinkSplashPages.query()
        .patchAndFetchById(existingSplash.id, req.body);
    } else {
      splashPage = await LinkSplashPages.query().insert({
        link_id: req.params.linkId,
        ...req.body
      });
    }

    // Update link to indicate it has a splash page
    await Link.query()
      .patchAndFetchById(req.params.linkId, {
        has_splash_page: req.body.is_active !== false
      });

    res.json({ splashPage });
  })
);

// Delete splash page
router.delete("/:linkId", asyncHandler(auth.jwt), asyncHandler(async (req, res) => {
  const link = await Link.query()
    .findById(req.params.linkId)
    .where("user_id", req.user.id);

  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  await LinkSplashPages.query()
    .delete()
    .where("link_id", req.params.linkId);

  // Update link to indicate it no longer has a splash page
  await Link.query()
    .patchAndFetchById(req.params.linkId, {
      has_splash_page: false
    });

  res.json({ success: true });
}));

module.exports = router;
