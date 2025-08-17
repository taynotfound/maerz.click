const { Model } = require("objection");

class LinkPreviewsModel extends Model {
  static get tableName() {
    return "link_previews";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["link_id"],
      properties: {
        id: { type: "string" },
        link_id: { type: "string" },
        og_title: { type: ["string", "null"], maxLength: 200 },
        og_description: { type: ["string", "null"] },
        og_image_url: { type: ["string", "null"], maxLength: 500 },
        twitter_card_type: { type: "string", maxLength: 50 },
        custom_preview_config: { type: ["object", "null"] },
        auto_generated: { type: "boolean" },
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
          from: "link_previews.link_id",
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

module.exports = LinkPreviewsModel;
