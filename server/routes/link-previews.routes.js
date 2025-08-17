const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../handlers/auth.handler");
const { LinkPreviews, Link } = require("../models");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Get preview for link
router.get("/:linkId", asyncHandler(auth.jwt), asyncHandler(async (req, res) => {
  const link = await Link.query()
    .findById(req.params.linkId)
    .where("user_id", req.user.id);

  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  const preview = await LinkPreviews.query()
    .findOne("link_id", req.params.linkId);

  res.json({ preview });
}));

// Create/Update preview for link
router.post("/:linkId",
  asyncHandler(auth.jwt),
  [
    body("og_title").optional().isLength({ max: 200 }),
    body("og_description").optional(),
    body("og_image_url").optional().isURL(),
    body("twitter_card_type").optional().isIn(["summary", "summary_large_image", "app", "player"]),
    body("custom_preview_config").optional().isObject(),
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

    const existingPreview = await LinkPreviews.query()
      .findOne("link_id", req.params.linkId);

    let preview;
    if (existingPreview) {
      preview = await LinkPreviews.query()
        .patchAndFetchById(existingPreview.id, req.body);
    } else {
      preview = await LinkPreviews.query().insert({
        link_id: req.params.linkId,
        ...req.body
      });
    }

    // Update link to indicate it has a custom preview
    await Link.query()
      .patchAndFetchById(req.params.linkId, {
        has_custom_preview: true
      });

    res.json({ preview });
  })
);

// Auto-generate preview for link
router.post("/:linkId/generate", asyncHandler(auth.jwt), asyncHandler(async (req, res) => {
  const link = await Link.query()
    .findById(req.params.linkId)
    .where("user_id", req.user.id);

  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  try {
    // Simple preview generation (in production, you'd use a service to fetch metadata)
    const url = new URL(link.target);
    const domain = url.hostname;
    
    const previewData = {
      og_title: link.description || `Link to ${domain}`,
      og_description: `Shared via ${process.env.SITE_NAME || 'Kutt'}`,
      og_image_url: `https://api.screenshotmachine.com/640x480?url=${encodeURIComponent(link.target)}&device=desktop&cacheLimit=0`,
      twitter_card_type: "summary_large_image",
      auto_generated: true
    };

    const existingPreview = await LinkPreviews.query()
      .findOne("link_id", req.params.linkId);

    let preview;
    if (existingPreview) {
      preview = await LinkPreviews.query()
        .patchAndFetchById(existingPreview.id, previewData);
    } else {
      preview = await LinkPreviews.query().insert({
        link_id: req.params.linkId,
        ...previewData
      });
    }

    await Link.query()
      .patchAndFetchById(req.params.linkId, {
        has_custom_preview: true
      });

    res.json({ preview });
  } catch (error) {
    console.error("Error generating preview:", error);
    res.status(500).json({ error: "Failed to generate preview" });
  }
}));

// Bulk generate previews
router.post("/bulk-generate", asyncHandler(auth.jwt), asyncHandler(async (req, res) => {
  const { link_ids } = req.body;
  
  if (!Array.isArray(link_ids) || link_ids.length === 0) {
    return res.status(400).json({ error: "link_ids array required" });
  }

  const links = await Link.query()
    .whereIn("id", link_ids)
    .where("user_id", req.user.id);

  const results = [];
  
  for (const link of links) {
    try {
      const url = new URL(link.target);
      const domain = url.hostname;
      
      const previewData = {
        link_id: link.id,
        og_title: link.description || `Link to ${domain}`,
        og_description: `Shared via ${process.env.SITE_NAME || 'Kutt'}`,
        og_image_url: `https://api.screenshotmachine.com/640x480?url=${encodeURIComponent(link.target)}&device=desktop&cacheLimit=0`,
        twitter_card_type: "summary_large_image",
        auto_generated: true
      };

      const existingPreview = await LinkPreviews.query()
        .findOne("link_id", link.id);

      let preview;
      if (existingPreview) {
        preview = await LinkPreviews.query()
          .patchAndFetchById(existingPreview.id, previewData);
      } else {
        preview = await LinkPreviews.query().insert(previewData);
      }

      await Link.query()
        .patchAndFetchById(link.id, {
          has_custom_preview: true
        });

      results.push({ link_id: link.id, success: true, preview });
    } catch (error) {
      results.push({ link_id: link.id, success: false, error: error.message });
    }
  }

  res.json({ results });
}));

// Delete preview
router.delete("/:linkId", asyncHandler(auth.jwt), asyncHandler(async (req, res) => {
  const link = await Link.query()
    .findById(req.params.linkId)
    .where("user_id", req.user.id);

  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  await LinkPreviews.query()
    .delete()
    .where("link_id", req.params.linkId);

  await Link.query()
    .patchAndFetchById(req.params.linkId, {
      has_custom_preview: false
    });

  res.json({ success: true });
}));

module.exports = router;
