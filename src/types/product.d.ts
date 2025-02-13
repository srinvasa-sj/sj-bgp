export interface Product {
  id: string;
  productCategory: string;
  material: string;
  purity: string;
  name: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 