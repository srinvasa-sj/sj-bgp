import { Category, CategoryHierarchy } from "@/types/category";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FolderTree, Search, Lock, Unlock, Pencil } from "lucide-react";
import CategoryItem from "./CategoryItem";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface CategoryListProps {
  isLoading: boolean;
  categoryHierarchy: CategoryHierarchy[];
  selectedCategory: Category | null;
  selectedIds: Set<string>;
  categoryStats: Record<string, { productCount: number; lastUpdated: Date }>;
  searchQuery: string;
  filterStatus: "all" | "active" | "inactive";
  filterLevel: "all" | "main" | "sub";
  isOrderingLocked: boolean;
  onSearchChange: (value: string) => void;
  onFilterStatusChange: (value: "all" | "active" | "inactive") => void;
  onFilterLevelChange: (value: "all" | "main" | "sub") => void;
  onToggleSelection: (id: string) => void;
  onEdit: (category: Category) => void;
  onDragEnd: (result: any) => void;
  onToggleOrderingLock: () => void;
}

const CategoryList = ({
  isLoading,
  categoryHierarchy,
  selectedCategory,
  selectedIds,
  categoryStats,
  searchQuery,
  filterStatus,
  filterLevel,
  isOrderingLocked,
  onSearchChange,
  onFilterStatusChange,
  onFilterLevelChange,
  onToggleSelection,
  onEdit,
  onDragEnd,
  onToggleOrderingLock
}: CategoryListProps) => {
  const [selectAll, setSelectAll] = useState(false);
  const [orderNumber, setOrderNumber] = useState<Record<string, number>>({});

  const handleSelectAll = () => {
    if (selectAll) {
      onToggleSelection(''); // Clear all selections
    } else {
      // Select all visible categories
      const allVisibleCategoryIds = filteredHierarchy.flatMap(item => {
        const ids: string[] = [item.category.id];
        if (item.children.length > 0) {
          ids.push(...item.children.map(child => child.category.id));
        }
        return ids;
      });
      allVisibleCategoryIds.forEach(id => onToggleSelection(id));
    }
    setSelectAll(!selectAll);
  };

  const handleOrderChange = async (categoryId: string, newOrder: number) => {
    setOrderNumber(prev => ({ ...prev, [categoryId]: newOrder }));
    // Add your logic to update the order in the database
  };

  // Helper function to check if a category or its children match the search query
  const doesCategoryMatchSearch = (item: CategoryHierarchy): boolean => {
    const matchesSearch = item.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.path?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (matchesSearch) return true;
    
    // Check children recursively
    return item.children.some(child => doesCategoryMatchSearch(child));
  };

  // Filter categories based on search and filters
  const filterCategories = (items: CategoryHierarchy[]): CategoryHierarchy[] => {
    return items.map(item => {
      const category = item.category;
      
      // Check if this category or its children match the search
      const matchesSearch = searchQuery === "" || doesCategoryMatchSearch(item);
      
      // Check status filter
      const matchesStatus = filterStatus === "all" 
        ? true 
        : filterStatus === "active" ? category.isActive : !category.isActive;
      
      // Check level filter
      const matchesLevel = filterLevel === "all"
        ? true
        : filterLevel === "main" ? !category.parentId : !!category.parentId;
      
      // Filter children recursively
      const filteredChildren = filterCategories(item.children);
      
      // If this category matches all filters or has matching children, include it
      if ((matchesSearch && matchesStatus && matchesLevel) || filteredChildren.length > 0) {
        return {
          ...item,
          children: filteredChildren
        };
      }
      
      return null;
    }).filter((item): item is CategoryHierarchy => item !== null);
  };

  const filteredHierarchy = filterCategories(categoryHierarchy);

  const renderCategoryHierarchy = (hierarchyItem: CategoryHierarchy, index: number) => {
    return (
      <Draggable 
        key={hierarchyItem.category.id} 
        draggableId={hierarchyItem.category.id} 
        index={index}
        isDragDisabled={isOrderingLocked}
      >
        {(provided, snapshot) => (
          <>
            <CategoryItem
              hierarchyItem={hierarchyItem}
              provided={provided}
              snapshot={snapshot}
              selectedCategory={selectedCategory}
              selectedIds={selectedIds}
              categoryStats={categoryStats}
              onToggleSelection={onToggleSelection}
              onEdit={onEdit}
              orderNumber={orderNumber[hierarchyItem.category.id] || hierarchyItem.category.sortOrder}
              onOrderChange={(newOrder) => handleOrderChange(hierarchyItem.category.id, newOrder)}
            />
            
            {hierarchyItem.children.length > 0 && (
              <Droppable droppableId={hierarchyItem.category.id}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="ml-6 space-y-2"
                  >
                    {hierarchyItem.children.map((child, childIndex) => 
                      renderCategoryHierarchy(child, childIndex)
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </>
        )}
      </Draggable>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Categories</h2>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleOrderingLock}
              className="gap-2"
            >
              {isOrderingLocked ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Unlock Ordering</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Lock Ordering</span>
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={onFilterLevelChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="main">Parent Only</SelectItem>
                <SelectItem value="sub">Sub Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">Loading categories...</p>
        </div>
      ) : filteredHierarchy.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No categories found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="main">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="p-4 space-y-4">
                {filteredHierarchy.map((item, index) => renderCategoryHierarchy(item, index))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default CategoryList; 