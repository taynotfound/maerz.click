const { Model } = require("objection");

class LinkSplashPagesModel extends Model {
  static get tableName() {
    return "link_splash_pages";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["link_id"],
      properties: {
        id: { type: "string" },
        link_id: { type: "string" },
        template_type: { type: "string", maxLength: 50 },
        custom_html: { type: ["string", "null"] },
        custom_css: { type: ["string", "null"] },
        branding_config: { type: ["object", "null"] },
        is_active: { type: "boolean" },
        created_at: { type: "string" },
        updated_at: { type: "string" }
      }
    };
  }

  static get relationMappings() {
    const Link = require("./link.model");
    
    return {
      link: {
        relation: Model.BelongsToOneRelation,
        modelClass: Link,
        join: {
          from: "link_splash_pages.link_id",
          to: "links.id"
        }
      }
    };
  }

  $beforeInsert() {
    if (!this.id) {
      this.id = require('crypto').randomUUID();
    }
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = LinkSplashPagesModel;
