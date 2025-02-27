const DEFAULT_TEMPLATES = {
  new_product: {
    name: "new_product_template",
    language: "en",
    category: "marketing",
    components: [{
      type: "body",
      text: "🆕 New Product Alert!\n\n*{{product_name}}*\nPrice: {{product_price}}\n\n{{product_description}}\n\nShop now: {{product_link}}",
      variables: ["product_name", "product_price", "product_description", "product_link"]
    }]
  },
  new_promotion: {
    name: "new_promotion_template",
    language: "en",
    category: "marketing",
    components: [{
      type: "body",
      text: "🎉 Special Offer!\n\n*{{promotion_name}}*\n{{discount}} OFF\n\nValid until: {{valid_until}}\n\nShop now: {{promotion_link}}",
      variables: ["promotion_name", "discount", "valid_until", "promotion_link"]
    }]
  }
}; 