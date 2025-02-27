export interface InventoryItem {
  productId: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  name: string;
  category: string;
  price: number;
  imageUrl: string;
}

export interface ReorderSuggestion {
  productId: string;
  currentStock: number;
  suggestedOrderQuantity: number;
  priority: 'high' | 'medium' | 'low';
} 