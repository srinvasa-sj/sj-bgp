import { db } from "@/lib/firebase";
import { Category, NewCategory } from "@/types/category";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
  serverTimestamp,
  DocumentReference,
  DocumentData,
} from "firebase/firestore";
import { slugify } from "@/lib/utils";

const categoriesRef = collection(db, "categories");

export const categoryService = {
  async getCategories() {
    const q = query(categoriesRef, orderBy("sortOrder"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  },

  async getCategoryStats() {
    const productsRef = collection(db, "products");
    const productsSnapshot = await getDocs(productsRef);
    const stats: Record<string, { productCount: number; lastUpdated: Date }> = {};

    productsSnapshot.forEach((doc) => {
      const product = doc.data();
      if (product.categoryId) {
        if (!stats[product.categoryId]) {
          stats[product.categoryId] = {
            productCount: 0,
            lastUpdated: product.updatedAt?.toDate() || new Date()
          };
        }
        stats[product.categoryId].productCount++;
        const updatedAt = product.updatedAt?.toDate();
        if (updatedAt > stats[product.categoryId].lastUpdated) {
          stats[product.categoryId].lastUpdated = updatedAt;
        }
      }
    });

    return stats;
  },

  async addCategory(data: NewCategory) {
    const timestamp = serverTimestamp();
    const slug = slugify(data.name);
    
    // Check if slug exists
    const q = query(categoriesRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error("A category with this name already exists");
    }

    // Clean up the category data
    const categoryData = {
      name: data.name || '',
      slug,
      parentId: data.parentId === 'none' ? null : data.parentId,
      level: data.parentId && data.parentId !== 'none' ? 2 : 1,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      showInHeader: data.showInHeader ?? false,
      path: '',  // Path will be updated after creation
      hasChildren: false,
      attributes: data.attributes.map(attr => ({
        ...attr,
        id: attr.id || `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        options: attr.options || [],
        validation: {
          min: attr.validation?.min ?? 0,
          max: attr.validation?.max ?? null,
          pattern: attr.validation?.pattern ?? null
        }
      })),
      materialOptions: data.materialOptions.map(opt => ({
        type: opt.type,
        purity: opt.purity || [],
        designOptions: opt.designOptions || [],
        defaultPurity: opt.defaultPurity || null,
        defaultDesign: opt.defaultDesign || null,
        priceMultiplier: opt.priceMultiplier ?? 1
      })),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const docRef = await addDoc(categoriesRef, categoryData);
    
    // If this is a subcategory, update the parent's hasChildren flag
    if (categoryData.parentId) {
      const parentRef = doc(db, 'categories', categoryData.parentId);
      await updateDoc(parentRef, {
        hasChildren: true,
        updatedAt: timestamp
      });
    }

    return { id: docRef.id, ...categoryData };
  },

  async updateCategory(id: string, data: Partial<Category>) {
    const timestamp = serverTimestamp();
    const categoryRef = doc(db, "categories", id);
    
    console.log('Update data received:', data);
    
    // More strict check for header-only update
    const isOnlyHeaderUpdate = 
      Object.keys(data).length === 1 && 
      Object.keys(data)[0] === 'showInHeader' &&
      typeof data.showInHeader === 'boolean';

    console.log('Is header-only update:', isOnlyHeaderUpdate);

    if (isOnlyHeaderUpdate) {
      // For header visibility updates, only update showInHeader and timestamp
      const updateData = {
        showInHeader: data.showInHeader,
        updatedAt: timestamp
      };
      console.log('Updating header visibility with:', updateData);
      await updateDoc(categoryRef, updateData);
      return;
    }

    // For other updates, proceed with slug check and full update
    if (data.name) {
      const newSlug = slugify(data.name);
      const q = query(categoriesRef, where("slug", "==", newSlug));
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.some(doc => doc.id !== id)) {
        console.log('Duplicate category name found');
        throw new Error("A category with this name already exists");
      }
    }
    
    // Clean up the category data
    const categoryData = {
      ...data,
      updatedAt: timestamp
    };

    // Only include slug if we're updating the name
    if (data.name) {
      categoryData.slug = slugify(data.name);
    }

    // Handle attributes and materialOptions only if they are present in the update
    if (data.attributes) {
      categoryData.attributes = data.attributes.map(attr => ({
        ...attr,
        options: attr.options || [],
        validation: {
          min: attr.validation?.min ?? 0,
          max: attr.validation?.max ?? null,
          pattern: attr.validation?.pattern ?? null
        }
      }));
    }

    if (data.materialOptions) {
      categoryData.materialOptions = data.materialOptions.map(opt => ({
        type: opt.type,
        purity: opt.purity || [],
        designOptions: opt.designOptions || [],
        defaultPurity: opt.defaultPurity || null,
        defaultDesign: opt.defaultDesign || null,
        priceMultiplier: opt.priceMultiplier ?? 1
      }));
    }

    console.log('Updating category with:', categoryData);
    await updateDoc(categoryRef, categoryData);
  },

  async updateCategoryPath(id: string, categories: Category[]) {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    const getCategoryPath = (cat: Category): string => {
      if (!cat.parentId) return cat.name;
      const parent = categories.find(c => c.id === cat.parentId);
      if (!parent) return cat.name;
      return `${parent.name} > ${cat.name}`;
    };

    const path = getCategoryPath(category);
    const batch = writeBatch(db);

    // Update the category's path
    batch.update(doc(db, 'categories', id), {
      path,
      updatedAt: serverTimestamp()
    });

    // Update all subcategories' paths
    const updateSubcategoryPaths = (parentId: string, parentPath: string) => {
      const subcategories = categories.filter(cat => cat.parentId === parentId);
      subcategories.forEach(subcat => {
        const subcatPath = `${parentPath} > ${subcat.name}`;
        batch.update(doc(db, 'categories', subcat.id), {
          path: subcatPath,
          updatedAt: serverTimestamp()
        });
        updateSubcategoryPaths(subcat.id, subcatPath);
      });
    };

    updateSubcategoryPaths(id, path);
    await batch.commit();
  },

  async deleteCategory(id: string) {
    await deleteDoc(doc(db, "categories", id));
  },

  async bulkDeleteCategories(ids: string[]) {
    const batch = writeBatch(db);
    ids.forEach(id => {
      batch.delete(doc(db, "categories", id));
    });
    await batch.commit();
  },

  async bulkUpdateCategories(ids: string[], updates: Partial<Category>) {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    ids.forEach(id => {
      const categoryRef = doc(db, "categories", id) as DocumentReference<DocumentData>;
      batch.update(categoryRef, { ...updates, updatedAt: timestamp });
    });

    await batch.commit();
  },

  async updateCategoryOrder(categories: { id: string; sortOrder: number }[]) {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    categories.forEach(({ id, sortOrder }) => {
      const categoryRef = doc(db, "categories", id) as DocumentReference<DocumentData>;
      batch.update(categoryRef, { sortOrder, updatedAt: timestamp });
    });

    await batch.commit();
  }
}; 