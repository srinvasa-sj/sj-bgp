import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/types/category";

export interface ProductFilters {
  parentCategory?: string;
  subCategory?: string;
  material?: string;
  purity?: string;
  sortBy: 'default' | 'price_asc' | 'price_desc';
}

interface FilterBarProps {
  onFilterChange: (filters: ProductFilters) => void;
  materials: string[];
  purities: string[];
  categories: Category[];
}

export const FilterBar = ({ onFilterChange, materials, purities, categories }: FilterBarProps) => {
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  
  // Get parent categories (categories without parentId)
  const parentCategories = categories.filter(cat => !cat.parentId);
  
  // Get subcategories for selected parent category
  const subcategories = categories.filter(cat => cat.parentId === selectedParentCategory);

  // Handle parent category change
  const handleParentCategoryChange = (value: string) => {
    const newValue = value === 'all' ? undefined : value;
    setSelectedParentCategory(value === 'all' ? '' : value);
    onFilterChange({ 
      parentCategory: newValue,
      subCategory: undefined, // Reset subcategory when parent changes
      sortBy: 'default' 
    });
  };

  // Handle subcategory change
  const handleSubCategoryChange = (value: string) => {
    onFilterChange({ 
      parentCategory: selectedParentCategory,
      subCategory: value === 'all' ? undefined : value,
      sortBy: 'default' 
    });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Parent Category Filter */}
      <div className="w-full md:w-auto">
        <Select onValueChange={handleParentCategoryChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {parentCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory Filter - Only show if parent category is selected */}
      {selectedParentCategory && (
        <div className="w-full md:w-auto">
          <Select onValueChange={handleSubCategoryChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Subcategory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Material Filter */}
      <div className="w-full md:w-auto">
        <Select
          onValueChange={(value) => 
            onFilterChange({ 
              parentCategory: selectedParentCategory || undefined,
              subCategory: undefined,
              material: value === 'all' ? undefined : value, 
              sortBy: 'default' 
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Materials</SelectItem>
            {materials.map((material) => (
              <SelectItem key={material} value={material}>
                {material}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Purity Filter */}
      <div className="w-full md:w-auto">
        <Select
          onValueChange={(value) => 
            onFilterChange({ 
              parentCategory: selectedParentCategory || undefined,
              subCategory: undefined,
              purity: value === 'all' ? undefined : value, 
              sortBy: 'default' 
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Purity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Purities</SelectItem>
            {purities.map((purity) => (
              <SelectItem key={purity} value={purity}>
                {purity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="w-full md:w-auto">
        <Select
          onValueChange={(value: ProductFilters['sortBy']) => 
            onFilterChange({ 
              parentCategory: selectedParentCategory || undefined,
              subCategory: undefined,
              sortBy: value 
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}; 