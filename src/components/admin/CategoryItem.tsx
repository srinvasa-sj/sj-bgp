// import { Category } from "@/types/category";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { formatDistanceToNow } from "date-fns";
// import { GripVertical, Pencil, Clock, Package } from 'lucide-react';
// import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";

// interface CategoryItemProps {
//   category: Category;
//   level: number;
//   path: string[];
//   provided: DraggableProvided;
//   snapshot: DraggableStateSnapshot;
//   selectedIds: Set<string>;
//   categoryStats: { productCount: number; lastUpdated: Date };
//   onToggleSelection: (id: string) => void;
//   onEdit: (category: Category) => void;
// }

// const CategoryItem = ({
//   category,
//   level,
//   path,
//   provided,
//   snapshot,
//   selectedIds,
//   categoryStats,
//   onToggleSelection,
//   onEdit
// }: CategoryItemProps) => {
//   return (
//     <div
//       ref={provided.innerRef}
//       {...provided.draggableProps}
//       className={`
//         relative p-3 rounded-lg border 
//         ${snapshot.isDragging ? 'shadow-lg bg-white' : 'bg-white hover:bg-gray-50'} 
//         ${!category.isActive ? 'opacity-60' : ''}
//       `}
//     >
//       <div className="flex items-center gap-3">
//         <div {...provided.dragHandleProps} className="cursor-grab">
//           <GripVertical className="h-5 w-5 text-gray-400" />
//         </div>
        
//         <Checkbox
//           checked={selectedIds.has(category.id)}
//           onCheckedChange={() => onToggleSelection(category.id)}
//           className="translate-y-[1px]"
//         />

//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2">
//             <span className="font-medium truncate">{category.name}</span>
//             {!category.isActive && (
//               <Badge variant="secondary" className="text-xs">Inactive</Badge>
//             )}
//             {level > 1 && (
//               <Badge variant="outline" className="text-xs">Sub-category</Badge>
//             )}
//           </div>
          
//           <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
//             {path.length > 0 && (
//               <span className="truncate">
//                 Path: {path.join(" > ")}
//               </span>
//             )}
//             {categoryStats && (
//               <>
//                 <span className="flex items-center gap-1">
//                   <Package className="h-4 w-4" />
//                   {categoryStats.productCount} products
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   Updated {formatDistanceToNow(categoryStats.lastUpdated, { addSuffix: true })}
//                 </span>
//               </>
//             )}
//           </div>
//         </div>

//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => onEdit(category)}
//           className="ml-auto"
//         >
//           <Pencil className="h-4 w-4" />
//           <span className="sr-only">Edit</span>
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default CategoryItem; 

import { Category, CategoryHierarchy } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { GripVertical, Pencil, Clock, Package } from "lucide-react";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { Input } from "@/components/ui/input";

interface CategoryItemProps {
  hierarchyItem: CategoryHierarchy;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  selectedCategory: Category | null;
  selectedIds: Set<string>;
  categoryStats: Record<string, { productCount: number; lastUpdated: Date }>;
  onToggleSelection: (id: string) => void;
  onEdit: (category: Category) => void;
  orderNumber?: number;
  onOrderChange?: (newOrder: number) => void;
}

const CategoryItem = ({
  hierarchyItem,
  provided,
  snapshot,
  selectedCategory,
  selectedIds,
  categoryStats,
  onToggleSelection,
  onEdit,
  orderNumber,
  onOrderChange
}: CategoryItemProps) => {
  const { category } = hierarchyItem;
  const stats = categoryStats[category.id];

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`
        relative p-3 rounded-lg border 
        ${snapshot.isDragging ? 'shadow-lg bg-white' : 'bg-white hover:bg-gray-50'} 
        ${selectedCategory?.id === category.id ? 'ring-2 ring-primary' : ''}
        ${!category.isActive ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <div {...provided.dragHandleProps} className="cursor-grab">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        
        <Checkbox
          checked={selectedIds.has(category.id)}
          onCheckedChange={() => onToggleSelection(category.id)}
          className="data-[state=checked]:bg-primary"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {category.name}
            </span>
            {!category.isActive && (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {category.hasChildren && (
              <Badge variant="outline" className="text-xs">
                Parent
              </Badge>
            )}
          </div>
          
          {category.description && (
            <p className="text-sm text-gray-500 truncate mt-0.5">
              {category.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-gray-600">Order: {orderNumber}</span>
            </span>
            {stats && (
              <>
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {stats.productCount} products
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Updated {formatDistanceToNow(stats.lastUpdated, { addSuffix: true })}
                </span>
              </>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(category)}
          className="shrink-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CategoryItem; 