// React and routing
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Third-party libraries
import { toast } from 'sonner';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { formatDistanceToNow } from 'date-fns';

// Icons
import { 
  Loader2, 
  FolderTree, 
  ArrowLeft, 
  Download, 
  Upload, 
  Plus, 
  Lock, 
  Unlock,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  X
} from 'lucide-react';

// Firebase
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

// Custom components
import CategoryForm from '@/components/admin/CategoryForm';
import CategoryItem from '@/components/admin/CategoryItem';
import CategoryList from '@/components/admin/CategoryList';

// Types
import { 
  Category, 
  CategoryAttribute, 
  MaterialOption, 
  NewCategory, 
  CategoryHierarchy 
} from '@/types/category';

// Utils
import { slugify } from '@/lib/utils';

// Add these types near the top of the file
import { DropResult } from 'react-beautiful-dnd';

// Add these type definitions at the top after imports
type FilterStatus = "all" | "active" | "inactive";
type FilterLevel = "all" | "main" | "sub";

// Default suggested categories
const defaultSuggestedCategories = [
  {
    name: "Earrings",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      }
    ]
  },
  {
    name: "Bangles",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      },
      {
        id: "size",
        name: "Size",
        type: "select",
        required: true,
        options: ["2.2", "2.4", "2.6", "2.8", "3.0"]
      }
    ]
  },
  {
    name: "Bracelets",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      },
      {
        id: "length",
        name: "Length",
        type: "number",
        required: true,
        options: [],
        unit: "inches"
      }
    ]
  },
  {
    name: "Necklaces",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      },
      {
        id: "length",
        name: "Length",
        type: "number",
        required: true,
        options: [],
        unit: "inches"
      }
    ]
  },
  {
    name: "Chains",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      },
      {
        id: "length",
        name: "Length",
        type: "select",
        required: true,
        options: ["16", "18", "20", "22", "24"],
        unit: "inches"
      }
    ]
  },
  {
    name: "Mangalasutra",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      },
      {
        id: "length",
        name: "Length",
        type: "number",
        required: true,
        options: [],
        unit: "inches"
      }
    ]
  },
  {
    name: "Pendants",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      }
    ]
  },
  {
    name: "Anklets",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      },
      {
        id: "length",
        name: "Length",
        type: "number",
        required: true,
        options: [],
        unit: "inches"
      }
    ]
  },
  {
    name: "Rings",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      },
      {
        id: "size",
        name: "Size",
        type: "select",
        required: true,
        options: ["6", "7", "8", "9", "10", "11", "12"]
      }
    ]
  },
  {
    name: "Nosepins",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      }
    ]
  },
  {
    name: "Toe Rings",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      },
      {
        id: "size",
        name: "Size",
        type: "select",
        required: true,
        options: ["adjustable"]
      }
    ]
  },
  {
    name: "Occasion",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      }
    ]
  },
  {
    name: "Haras",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      },
      {
        id: "length",
        name: "Length",
        type: "number",
        required: true,
        options: [],
        unit: "inches"
      }
    ]
  },
  {
    name: "Men's Jewellery",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      }
    ]
  },
  {
    name: "Kid's Jewellery",
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      }
    ]
  }
];

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState<CategoryHierarchy[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isOrderingLocked, setIsOrderingLocked] = useState(false);
  const [categoryStats, setCategoryStats] = useState<Record<string, { productCount: number; lastUpdated: Date }>>({});

  const defaultCategory: Category = {
    id: 'new',
    name: "",
    slug: "",
    parentId: null,
    level: 1,
    isActive: true,
    sortOrder: 0,
    path: "",
    hasChildren: false,
    showInHeader: false,
    attributes: [
      {
        id: "weight",
        name: "Weight",
        type: "weight",
        required: true,
        options: [],
        unit: "g"
      }
    ],
    materialOptions: [
      {
        type: "Gold",
        purity: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
        designOptions: [
          "Antique",
          "Kundan",
          "Meenakari",
          "Jadau",
          "Temple",
          "Modern",
          "Gemstone",
          "Traditional",
          "Fancy"
        ],
        defaultPurity: "22 Karat",
        defaultDesign: "Traditional"
      }
    ]
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsAddingCategory(true);
  };

  const handleAddCategory = async (data: NewCategory) => {
    setIsSubmitting(true);
    try {
      const timestamp = serverTimestamp();
      // Clean and prepare the data before saving
      const categoryToSave = {
        name: data.name,
        slug: slugify(data.name),
        parentId: data.parentId || null,
        level: data.parentId ? 2 : 1,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? categories.length + 1,
        path: data.parentId 
          ? `${categories.find(c => c.id === data.parentId)?.name || ''} > ${data.name}`
          : data.name,
        hasChildren: false,
        showInHeader: data.showInHeader ?? false,
        createdAt: timestamp,
        updatedAt: timestamp,
        // Clean attributes - removed validation object
        attributes: data.attributes.map(attr => ({
          id: attr.id,
          name: attr.name,
          type: attr.type,
          required: attr.required ?? false,
          options: attr.options || [],
          unit: attr.unit || ""
        })),
        // Clean material options - removed priceMultiplier
        materialOptions: data.materialOptions.map(mat => ({
          type: mat.type,
          purity: mat.purity || [],
          designOptions: mat.designOptions || [],
          defaultPurity: mat.defaultPurity || mat.purity?.[0] || "",
          defaultDesign: mat.defaultDesign || "Traditional"
        }))
      };

      if (data.id === 'new' || !data.id) {
        // Add new category
        await addDoc(collection(db, 'categories'), categoryToSave);
        toast.success('Category added successfully');
      } else {
        // Update existing category
        const { createdAt, ...updateData } = categoryToSave;
        await updateDoc(doc(db, 'categories', data.id), updateData);
        toast.success('Category updated successfully');
      }

      setIsAddingCategory(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelection = (categoryId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
    } else {
      newSelection.add(categoryId);
    }
    setSelectedIds(newSelection);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || isOrderingLocked) return;

    try {
      const { source, destination, draggableId } = result;
      
      // If dropped in the same position, do nothing
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      // Get the moved category
      const movedCategory = categories.find(cat => cat.id === draggableId);
      if (!movedCategory) return;

      // Get all categories at the same level (either main categories or siblings)
      const sameLevel = categories.filter(cat => {
        if (destination.droppableId === 'main') {
          return !cat.parentId; // Main categories
        }
        return cat.parentId === destination.droppableId; // Subcategories
      });

      // Calculate new sort order
      let newSortOrder: number;
      if (sameLevel.length === 0) {
        newSortOrder = 1;
      } else if (destination.index === 0) {
        newSortOrder = sameLevel[0].sortOrder / 2;
      } else if (destination.index >= sameLevel.length) {
        newSortOrder = sameLevel[sameLevel.length - 1].sortOrder + 1;
      } else {
        const before = sameLevel[destination.index - 1].sortOrder;
        const after = sameLevel[destination.index].sortOrder;
        newSortOrder = (before + after) / 2;
      }

      // Update the category in Firestore
      const batch = writeBatch(db);
      const categoryRef = doc(db, 'categories', draggableId);
      
      const updates: Partial<Category> = {
        sortOrder: newSortOrder,
        updatedAt: serverTimestamp()
      };

      // If moving between different levels, update parentId and path
      if (source.droppableId !== destination.droppableId) {
        const newParentId = destination.droppableId === 'main' ? null : destination.droppableId;
        const newLevel = destination.droppableId === 'main' ? 1 : 2;
        
        // Update path based on new parent
        let newPath = movedCategory.name;
        if (newParentId) {
          const parentCategory = categories.find(cat => cat.id === newParentId);
          if (parentCategory) {
            newPath = `${parentCategory.name} > ${movedCategory.name}`;
          }
        }

        updates.parentId = newParentId;
        updates.level = newLevel;
        updates.path = newPath;
        
        // Update hasChildren flags
        if (source.droppableId !== 'main') {
          const oldParentCategory = categories.find(cat => cat.id === source.droppableId);
          if (oldParentCategory) {
            const oldParentHasOtherChildren = categories.some(
              cat => cat.parentId === oldParentCategory.id && cat.id !== draggableId
            );
            batch.update(doc(db, 'categories', oldParentCategory.id), {
              hasChildren: oldParentHasOtherChildren,
              updatedAt: serverTimestamp()
            });
          }
        }
        
        if (destination.droppableId !== 'main') {
          batch.update(doc(db, 'categories', destination.droppableId), {
            hasChildren: true,
            updatedAt: serverTimestamp()
          });
        }
      }

      batch.update(categoryRef, updates);
      await batch.commit();

      // Refresh categories to get the new order
      await fetchCategories();
      toast.success('Category order updated successfully');
    } catch (error) {
      console.error('Error updating category order:', error);
      toast.error('Failed to update category order');
    }
  };

  const fetchCategories = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('sortOrder'));
      const querySnapshot = await getDocs(q);
      
      const fetchedCategories: Category[] = [];
      const stats: Record<string, { productCount: number; lastUpdated: Date }> = {};

      querySnapshot.forEach((doc) => {
        const categoryData = doc.data();
        const category: Category = {
          id: doc.id,
          name: categoryData.name || '',
          slug: categoryData.slug || slugify(categoryData.name || ''),
          parentId: categoryData.parentId || null,
          level: categoryData.level || 1,
          isActive: categoryData.isActive ?? true,
          sortOrder: categoryData.sortOrder || 0,
          showInHeader: categoryData.showInHeader ?? false,
          path: categoryData.path || categoryData.name || '',
          hasChildren: categoryData.hasChildren ?? false,
          attributes: Array.isArray(categoryData.attributes) ? categoryData.attributes : [],
          materialOptions: Array.isArray(categoryData.materialOptions) ? categoryData.materialOptions : [],
          description: categoryData.description || '',
          updatedAt: categoryData.updatedAt ? new Date(categoryData.updatedAt.seconds * 1000) : new Date(),
          createdAt: categoryData.createdAt ? new Date(categoryData.createdAt.seconds * 1000) : new Date()
        };
        fetchedCategories.push(category);
        stats[doc.id] = {
          productCount: 0,
          lastUpdated: category.updatedAt || new Date(),
        };
      });

      // Build hierarchy
      const hierarchy: CategoryHierarchy[] = [];
      const categoryMap = new Map<string, Category>();
      fetchedCategories.forEach(cat => categoryMap.set(cat.id, cat));

      fetchedCategories.forEach(category => {
        if (!category.parentId) {
          hierarchy.push(buildHierarchyItem(category, categoryMap));
        }
      });

      setCategories(fetchedCategories);
      setCategoryHierarchy(hierarchy);
      setCategoryStats(stats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
      console.error('Error fetching categories:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const buildHierarchyItem = (category: Category, categoryMap: Map<string, Category>): CategoryHierarchy => {
    const children: CategoryHierarchy[] = [];
    categoryMap.forEach(cat => {
      if (cat.parentId === category.id) {
        children.push(buildHierarchyItem(cat, categoryMap));
      }
    });

    return {
      category,
      children,
      level: category.level || 1,
      path: [category.name],
    };
  };

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      if (!mounted) return;
      await fetchCategories();
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const searchableText = category.name.toLowerCase();
      const matchesSearch = searchQuery === '' || searchableText.includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" 
        ? true 
        : filterStatus === "active" ? category.isActive : !category.isActive;
      const matchesLevel = filterLevel === "all"
        ? true
        : filterLevel === "main" ? !category.parentId : !!category.parentId;
      
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [categories, searchQuery, filterStatus, filterLevel]);

  // Add these handler functions
  const handleFilterStatusChange = (value: FilterStatus) => {
    setFilterStatus(value);
  };

  const handleFilterLevelChange = (value: FilterLevel) => {
    setFilterLevel(value);
  };

  const handleBulkToggleActive = async (setActive: boolean) => {
    if (selectedIds.size === 0) {
      toast.error("Please select categories to modify");
      return;
    }

    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        const docRef = doc(db, 'categories', id);
        batch.update(docRef, { 
          isActive: setActive,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      toast.success(`${selectedIds.size} categories ${setActive ? 'activated' : 'deactivated'} successfully`);
      setSelectedIds(new Set());
      await fetchCategories();
    } catch (error) {
      console.error('Error updating categories:', error);
      toast.error(`Failed to ${setActive ? 'activate' : 'deactivate'} categories`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select categories to delete");
      return;
    }

    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        const docRef = doc(db, 'categories', id);
        batch.delete(docRef);
      });
      
      await batch.commit();
      toast.success(`${selectedIds.size} categories deleted successfully`);
      setSelectedIds(new Set());
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting categories:', error);
      toast.error('Failed to delete categories');
    }
  };

  const handleExportCategories = () => {
    try {
      const exportData = categories.map(({ id, name, slug, parentId, level, isActive, path, attributes, materialOptions }) => ({
        id,
        name,
        slug,
        parentId,
        level,
        isActive,
        path,
        attributes,
        materialOptions
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Categories exported successfully');
    } catch (error) {
      console.error('Error exporting categories:', error);
      toast.error('Failed to export categories');
    }
  };

  const handleImportCategories = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!Array.isArray(importData)) {
        throw new Error('Invalid import data format');
      }

      // Validate required fields for each category
      const requiredFields = ['name', 'slug', 'level', 'isActive', 'sortOrder', 'path', 'hasChildren', 'attributes', 'materialOptions'];
      const invalidCategories = importData.filter(category => 
        !requiredFields.every(field => field in category)
      );

      if (invalidCategories.length > 0) {
        throw new Error(`Invalid category data: Missing required fields in ${invalidCategories.length} categories`);
      }

      const batch = writeBatch(db);
      const timestamp = serverTimestamp();
      
      importData.forEach(category => {
        const docRef = doc(db, 'categories', category.id);
        batch.set(docRef, {
          ...category,
          updatedAt: timestamp,
          createdAt: timestamp,
          showInHeader: category.showInHeader ?? false,
          description: category.description ?? ""
        });
      });
      
      await batch.commit();
      toast.success(`${importData.length} categories imported successfully`);
      await fetchCategories();
    } catch (error) {
      console.error('Error importing categories:', error);
      toast.error('Failed to import categories: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      // Reset the file input
      e.target.value = '';
    }
  };

  const addTestCategory = async () => {
    // Implementation for adding test category in development mode
    toast.error("Add test category not implemented yet");
  };

  const handleSuggestedCategoryClick = async (suggestedCategory: typeof defaultSuggestedCategories[0]) => {
    // Improved duplicate check - case insensitive and handles variations in spacing
    const isDuplicate = categories.some(existingCat => {
      const normalizedExisting = existingCat.name.toLowerCase().trim();
      const normalizedNew = suggestedCategory.name.toLowerCase().trim();
      return normalizedExisting === normalizedNew;
    });
    
    if (isDuplicate) {
      toast.error(`A category with name "${suggestedCategory.name}" already exists`);
      return;
    }

    // Create new category data with simplified structure
    const newCategoryData = {
      name: suggestedCategory.name,
      slug: slugify(suggestedCategory.name),
      parentId: null,
      level: 1,
      isActive: true,
      sortOrder: categories.length + 1,
      path: suggestedCategory.name,
      hasChildren: false,
      showInHeader: false,
      attributes: suggestedCategory.attributes.map(attr => ({
        id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: attr.name,
        type: attr.type,
        required: attr.required,
        options: attr.options || [],
        unit: attr.unit || ""
      })),
      materialOptions: [
        {
          type: "Gold",
          purity: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
          designOptions: [
            "Antique",
            "Kundan",
            "Meenakari",
            "Jadau",
            "Temple",
            "Modern",
            "Gemstone",
            "Traditional",
            "Fancy"
          ],
          defaultPurity: "22 Karat",
          defaultDesign: "Traditional"
        }
      ]
    };

    try {
      await handleAddCategory(newCategoryData);
      toast.success(`${suggestedCategory.name} category created successfully`);
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(`Failed to create ${suggestedCategory.name} category. Please try again.`);
    }
  };

  return (
    <div className="h-full">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your product categories, subcategories, and attributes
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsOrderingLocked(!isOrderingLocked)}
              className="gap-2 min-w-[140px] bg-gray-100 hover:bg-gray-200"
            >
              {isOrderingLocked ? (
                <>
                  <Lock className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-600">Ordering Locked</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Ordering Unlocked</span>
                </>
              )}
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportCategories}
              className="hidden"
              id="import-categories"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCategories}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('import-categories')?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            {selectedIds.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <span>Bulk Actions</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {selectedIds.size}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleBulkToggleActive(true)}>
                    Activate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkToggleActive(false)}>
                    Deactivate Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button 
              onClick={() => {
                setSelectedCategory(defaultCategory);
                setIsAddingCategory(true);
              }}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add New Category</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left side: Category List */}
          <div className="w-1/2">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="mb-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterStatus} onValueChange={handleFilterStatusChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterLevel} onValueChange={handleFilterLevelChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="main">Main Categories</SelectItem>
                      <SelectItem value="sub">Sub Categories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <CategoryList
                  categoryHierarchy={categoryHierarchy}
                  selectedCategory={selectedCategory}
                  selectedIds={selectedIds}
                  categoryStats={categoryStats}
                  searchQuery={searchQuery}
                  filterStatus={filterStatus}
                  filterLevel={filterLevel}
                  isOrderingLocked={isOrderingLocked}
                  isLoading={isLoading}
                  onToggleSelection={toggleSelection}
                  onEdit={handleEditCategory}
                  onDragEnd={onDragEnd}
                  onToggleOrderingLock={() => setIsOrderingLocked(!isOrderingLocked)}
                  onSearchChange={setSearchQuery}
                  onFilterStatusChange={handleFilterStatusChange}
                  onFilterLevelChange={handleFilterLevelChange}
                />
              )}
            </div>
          </div>

          {/* Right side: Category Form */}
          <div className="w-1/2">
            {isAddingCategory && (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6">
                  {selectedCategory?.id === 'new' ? 'Add New Category' : 'Edit Category'}
                  </h2>
                <CategoryForm
                  category={selectedCategory || defaultCategory}
                  categories={categories.filter(cat => !cat.parentId)} // Only show parent categories
                  onSave={handleAddCategory}
                  onCancel={() => {
                    setIsAddingCategory(false);
                    setSelectedCategory(null);
                  }}
                  isSubmitting={isSubmitting}
                  showInHeader={selectedCategory?.showInHeader ?? defaultCategory.showInHeader}
                  suggestedCategories={defaultSuggestedCategories}
                  onSuggestedCategoryClick={handleSuggestedCategoryClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement; 
