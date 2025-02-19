// export interface Category {
//   id: string;
//   name: string;
//   slug: string;
//   parentId: string | null;
//   level: number;
//   isActive: boolean;
//   sortOrder: number;
//   path: string;
//   hasChildren: boolean;
//   description?: string;
//   attributes: CategoryAttribute[];
//   materialOptions: MaterialOption[];
//   createdAt?: any;
//   updatedAt?: any;
//   showInHeader?: boolean;
// }

// export interface CategoryAttribute {
//   id: string;
//   name: string;
//   type: string;
//   required: boolean;
//   options: string[];
//   unit?: string;
//   validation?: {
//     min?: number | null;
//     max?: number | null;
//     pattern?: string | null;
//   };
// }

// export interface MaterialOption {
//   type: string;
//   purity: string[];
//   designOptions: string[];
//   defaultPurity?: string | null;
//   defaultDesign?: string | null;
//   priceMultiplier?: number;
// }

// export interface NewCategory extends Omit<Category, 'id'> {
//   id?: string;
// }

// export interface CategoryHierarchy {
//   category: Category;
//   children: CategoryHierarchy[];
//   level: number;
//   path: string[];
// } 


export interface Category {
  id: string;
  name: string;
  description?: string; // Category description
  slug: string;
  parentId: string | null;
  level: number;
  isActive: boolean;
  sortOrder: number;
  
  path?: string; // Full path of category (e.g., "Jewelry > Rings > Diamond")
  hasChildren?: boolean;
  attributes: CategoryAttribute[];
  materialOptions: MaterialOption[];
  
  metadata?: {
    totalProducts?: number;
    activeProducts?: number;
    subcategoryCount?: number;
  };
  createdAt?: any;
  updatedAt?: any;
  showInHeader: boolean; // Controls whether this category appears in the header
  
}

export interface CategoryAttribute {
  id: string;
  name: string;
  type: string; // "text" | "number" | "select" | "multiselect" | "boolean" | "date" | "weight" | "dimensions"
  required: boolean;
  options: string[];
  unit?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface MaterialOption {
  type: string;
  purity: string[];
  designOptions: string[];
  defaultPurity?: string;
  defaultDesign?: string;
  priceMultiplier?: number;
}

export interface NewCategory extends Omit<Category, 'id'> {
  id?: string;
}

export interface CategoryStats {
  productCount: number;
  lastUpdated: Date;
  activeProducts?: number;
  totalRevenue?: number;
  averageRating?: number;
}

export interface CategoryHierarchy {
  category: Category;
  children: CategoryHierarchy[];
  level: number;
  path: string[];
} 