const { Model } = require("objection");
const knex = require("../knex");

// Bind all models to the knex instance
Model.knex(knex);

const LinkSplashPages = require("./link-splash-pages.model");
const LinkPreviews = require("./link-previews.model");

module.exports = {
  ...require("./domain.model"),
  ...require("./host.model"),
  ...require("./ip.model"),
  ...require("./link.model"),
  ...require("./user.model"),
  ...require("./visit.model"),
  LinkSplashPages,
  LinkPreviews,
}
