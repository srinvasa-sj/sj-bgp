export interface CategoryTable {
  Row: {
    created_at: string | null;
    description: string | null;
    id: string;
    image_url: string | null;
    name: string;
    slug: string;
    updated_at: string | null;
  };
  Insert: {
    created_at?: string | null;
    description?: string | null;
    id?: string;
    image_url?: string | null;
    name: string;
    slug: string;
    updated_at?: string | null;
  };
  Update: {
    created_at?: string | null;
    description?: string | null;
    id?: string;
    image_url?: string | null;
    name?: string;
    slug?: string;
    updated_at?: string | null;
  };
  Relationships: [];
}

export interface InventoryTable {
  Row: {
    created_at: string | null;
    id: string;
    low_stock_threshold: number | null;
    product_id: string | null;
    quantity: number;
    updated_at: string | null;
    variation_id: string | null;
  };
  Insert: {
    created_at?: string | null;
    id?: string;
    low_stock_threshold?: number | null;
    product_id?: string | null;
    quantity?: number;
    updated_at?: string | null;
    variation_id?: string | null;
  };
  Update: {
    created_at?: string | null;
    id?: string;
    low_stock_threshold?: number | null;
    product_id?: string | null;
    quantity?: number;
    updated_at?: string | null;
    variation_id?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "inventory_product_id_fkey";
      columns: ["product_id"];
      isOneToOne: false;
      referencedRelation: "products";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "inventory_variation_id_fkey";
      columns: ["variation_id"];
      isOneToOne: false;
      referencedRelation: "product_variations";
      referencedColumns: ["id"];
    }
  ];
}

export interface ProductImageTable {
  Row: {
    alt_text: string | null;
    created_at: string | null;
    display_order: number | null;
    id: string;
    is_primary: boolean | null;
    product_id: string | null;
    url: string;
  };
  Insert: {
    alt_text?: string | null;
    created_at?: string | null;
    display_order?: number | null;
    id?: string;
    is_primary?: boolean | null;
    product_id?: string | null;
    url: string;
  };
  Update: {
    alt_text?: string | null;
    created_at?: string | null;
    display_order?: number | null;
    id?: string;
    is_primary?: boolean | null;
    product_id?: string | null;
    url?: string;
  };
  Relationships: [
    {
      foreignKeyName: "product_images_product_id_fkey";
      columns: ["product_id"];
      isOneToOne: false;
      referencedRelation: "products";
      referencedColumns: ["id"];
    }
  ];
}

export interface ProductVariationTable {
  Row: {
    created_at: string | null;
    id: string;
    name: string;
    price_adjustment: number | null;
    product_id: string | null;
    value: string;
  };
  Insert: {
    created_at?: string | null;
    id?: string;
    name: string;
    price_adjustment?: number | null;
    product_id?: string | null;
    value: string;
  };
  Update: {
    created_at?: string | null;
    id?: string;
    name?: string;
    price_adjustment?: number | null;
    product_id?: string | null;
    value?: string;
  };
  Relationships: [
    {
      foreignKeyName: "product_variations_product_id_fkey";
      columns: ["product_id"];
      isOneToOne: false;
      referencedRelation: "products";
      referencedColumns: ["id"];
    }
  ];
}

export interface ProductTable {
  Row: {
    category_id: string | null;
    created_at: string | null;
    description: string | null;
    id: string;
    name: string;
    price: number;
    slug: string;
    status: string | null;
    updated_at: string | null;
  };
  Insert: {
    category_id?: string | null;
    created_at?: string | null;
    description?: string | null;
    id?: string;
    name: string;
    price: number;
    slug: string;
    status?: string | null;
    updated_at?: string | null;
  };
  Update: {
    category_id?: string | null;
    created_at?: string | null;
    description?: string | null;
    id?: string;
    name?: string;
    price?: number;
    slug?: string;
    status?: string | null;
    updated_at?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "products_category_id_fkey";
      columns: ["category_id"];
      isOneToOne: false;
      referencedRelation: "categories";
      referencedColumns: ["id"];
    }
  ];
}