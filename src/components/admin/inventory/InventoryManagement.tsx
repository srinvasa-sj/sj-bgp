import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { Trash as TrashIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { InventoryItem, ReorderSuggestion } from '@/types/inventory';

export const InventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [inventoryData, suggestions] = await Promise.all([
        inventoryService.getInventoryStatus(),
        inventoryService.generateReorderSuggestions()
      ]);
      setInventory(inventoryData);
      setReorderSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-600 bg-green-100';
      case 'low_stock':
        return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAddProduct = () => {
    // Implement add product logic
  };

  const handleEditProduct = (product: InventoryItem) => {
    // Implement edit product logic
  };

  const handleDeleteProduct = (productId: string) => {
    // Implement delete product logic
  };

  const getStockBadgeVariant = (stock: number): "default" | "secondary" | "destructive" | "outline" => {
    if (stock > 0) {
      return 'secondary';
    } else if (stock === 0) {
      return 'destructive';
    } else {
      return 'outline';
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventory.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <div>Loading inventory data...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px]"
          />
              </div>
        <Button onClick={handleAddProduct} className="w-full sm:w-auto">
          Add New Product
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Product</th>
              <th className="p-3 text-left font-medium hidden sm:table-cell">Category</th>
              <th className="p-3 text-left font-medium">Stock</th>
              <th className="p-3 text-left font-medium hidden sm:table-cell">Price</th>
              <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
          <tbody>
            {currentItems.map((product) => (
              <tr key={product.productId} className="border-b">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-muted-foreground text-xs sm:hidden">
                        {product.category}
                      </span>
                      <span className="text-muted-foreground text-xs sm:hidden">
                        ${product.price}
                      </span>
                    </div>
                  </div>
                    </td>
                <td className="p-3 hidden sm:table-cell">{product.category}</td>
                <td className="p-3">
                  <Badge variant={getStockBadgeVariant(product.currentStock)}>
                    {product.currentStock}
                  </Badge>
                    </td>
                <td className="p-3 hidden sm:table-cell">${product.price}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.productId)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, inventory.length)} of{" "}
          {inventory.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={indexOfLastItem >= inventory.length}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}; 