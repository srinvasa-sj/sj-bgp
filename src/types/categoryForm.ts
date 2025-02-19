// import { Category, CategoryAttribute, MaterialOption } from './category';

// export interface CategoryFormProps {
//   category: Category;
//   categories: Category[];
//   onSave: (data: Category) => Promise<void>;
//   onCancel: () => void;
//   isSubmitting: boolean;
// }

// export interface CategoryFormData {
//   name: string;
//   parentId: string | null;
//   isActive: boolean;
//   attributes: CategoryAttribute[];
//   materialOptions: MaterialOption[];
//   showInHeader: boolean;
// }

// export interface AttributeFieldProps {
//   attribute: CategoryAttribute;
//   index: number;
//   onUpdate: (index: number, field: keyof CategoryAttribute, value: any) => void;
//   onRemove: (index: number) => void;
//   error?: string;
// } 

import { Category, NewCategory, CategoryAttribute, MaterialOption } from './category';

export interface CategoryFormProps {
  category: NewCategory;
  categories: Category[];
  onSave: (data: NewCategory) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  showInHeader: boolean;
  suggestedCategories?: Array<{
    name: string;
    attributes: Array<{
      id: string;
      name: string;
      type: string;
      required: boolean;
      options: string[];
      unit?: string;
    }>;
  }>;
  onSuggestedCategoryClick?: (suggestedCategory: CategoryFormProps['suggestedCategories'][0]) => Promise<void>;
}

export interface CategoryFormData extends NewCategory {
  // Add any additional form-specific fields here
}

export interface AttributeFieldProps {
  attribute: CategoryAttribute;
  index: number;
  onAttributeChange: (index: number, field: keyof CategoryAttribute, value: any) => void;
  onRemove: (index: number) => void;
  onAddOption: (index: number) => void;
  onRemoveOption: (attributeIndex: number, optionIndex: number) => void;
  newAttributeOption: string;
  setNewAttributeOption: (value: string) => void;
  error?: string;
} 