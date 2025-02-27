import { collection, doc, getDoc, getDocs, query, where, updateDoc, addDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InventoryItem, ReorderSuggestion } from '@/types/inventory';

interface StockMovement {
  productId: string;
  quantity: number;
  type: 'in' | 'out';
  reason: string;
  timestamp: Timestamp;
  performedBy: string;
}

interface SupplierInfo {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  averageDeliveryTime: number; // in days
  minimumOrderQuantity: number;
}

class InventoryService {
  // Inventory Management Methods
  async getInventoryStatus(): Promise<InventoryItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'inventory'));
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        productId: doc.id
      })) as InventoryItem[];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  async updateStock(productId: string, quantity: number, type: 'in' | 'out', reason: string, userId: string) {
    try {
      const inventoryRef = doc(db, 'inventory', productId);
      const inventoryDoc = await getDoc(inventoryRef);

      if (!inventoryDoc.exists()) {
        throw new Error('Product not found in inventory');
      }

      const currentInventory = inventoryDoc.data() as InventoryItem;
      const newStock = type === 'in' 
        ? currentInventory.currentStock + quantity
        : currentInventory.currentStock - quantity;

      // Update inventory
      await updateDoc(inventoryRef, {
        currentStock: newStock,
        status: this.calculateStockStatus(newStock, currentInventory.minimumStock, currentInventory.reorderPoint)
      });

      // Record stock movement
      await this.recordStockMovement({
        productId,
        quantity,
        type,
        reason,
        timestamp: Timestamp.now(),
        performedBy: userId
      });

      // Check if we need to create alerts
      await this.checkAndCreateAlerts(productId, newStock, currentInventory);

      return {
        productId,
        newStock,
        status: this.calculateStockStatus(newStock, currentInventory.minimumStock, currentInventory.reorderPoint)
      };
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  private calculateStockStatus(
    currentStock: number,
    minimumStock: number,
    reorderPoint: number
  ): InventoryItem['status'] {
    if (currentStock <= minimumStock) {
      return 'out_of_stock';
    } else if (currentStock <= reorderPoint) {
      return 'low_stock';
    }
    return 'in_stock';
  }

  private async recordStockMovement(movement: StockMovement) {
    try {
      await addDoc(collection(db, 'stockMovements'), movement);
    } catch (error) {
      console.error('Error recording stock movement:', error);
      throw error;
    }
  }

  private async checkAndCreateAlerts(productId: string, newStock: number, inventory: InventoryItem) {
    if (newStock <= inventory.reorderPoint) {
      const supplier = await this.getSupplierInfo(inventory.supplier);
      
      await addDoc(collection(db, 'inventoryAlerts'), {
        productId,
        type: newStock <= inventory.minimumStock ? 'CRITICAL_STOCK' : 'LOW_STOCK',
        currentStock: newStock,
        reorderSuggestion: {
          quantity: Math.max(
            supplier.minimumOrderQuantity,
            inventory.reorderPoint * 2 - newStock
          ),
          supplier: supplier.id,
          estimatedDelivery: supplier.averageDeliveryTime
        },
        createdAt: Timestamp.now(),
        status: 'pending'
      });
    }
  }

  // Supplier Management Methods
  async getSupplierInfo(supplierId: string): Promise<SupplierInfo> {
    try {
      const supplierDoc = await getDoc(doc(db, 'suppliers', supplierId));
      
      if (!supplierDoc.exists()) {
        throw new Error('Supplier not found');
      }

      return {
        id: supplierDoc.id,
        ...supplierDoc.data()
      } as SupplierInfo;
    } catch (error) {
      console.error('Error fetching supplier info:', error);
      throw error;
    }
  }

  // Stock Movement Analysis
  async getStockMovementHistory(productId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const movementsQuery = query(
        collection(db, 'stockMovements'),
        where('productId', '==', productId),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(movementsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching stock movement history:', error);
      throw error;
    }
  }

  // Inventory Reports
  async generateInventoryReport(startDate: Date, endDate: Date) {
    try {
      const movementsQuery = query(
        collection(db, 'stockMovements'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );

      const [movements, inventory] = await Promise.all([
        getDocs(movementsQuery),
        this.getInventoryStatus()
      ]);

      const movementsByProduct = new Map();
      
      movements.docs.forEach(doc => {
        const movement = doc.data() as StockMovement;
        const productMovements = movementsByProduct.get(movement.productId) || {
          inflow: 0,
          outflow: 0,
          movements: []
        };

        if (movement.type === 'in') {
          productMovements.inflow += movement.quantity;
        } else {
          productMovements.outflow += movement.quantity;
        }

        productMovements.movements.push({
          id: doc.id,
          ...movement
        });

        movementsByProduct.set(movement.productId, productMovements);
      });

      return {
        summary: {
          totalProducts: inventory.length,
          lowStockProducts: inventory.filter(item => item.status === 'low_stock').length,
          outOfStockProducts: inventory.filter(item => item.status === 'out_of_stock').length
        },
        inventory: inventory.map(item => ({
          ...item,
          movements: movementsByProduct.get(item.productId) || {
            inflow: 0,
            outflow: 0,
            movements: []
          }
        }))
      };
    } catch (error) {
      console.error('Error generating inventory report:', error);
      throw error;
    }
  }

  // Reorder Management
  async generateReorderSuggestions(): Promise<ReorderSuggestion[]> {
    try {
      const inventory = await this.getInventoryStatus();
      return inventory
        .filter(item => item.currentStock <= item.reorderPoint)
        .map(item => ({
            productId: item.productId,
            currentStock: item.currentStock,
          suggestedOrderQuantity: item.minimumStock - item.currentStock,
          priority: this.calculatePriority(item)
        }));
    } catch (error) {
      console.error('Error generating reorder suggestions:', error);
      throw error;
    }
  }

  private calculatePriority(item: InventoryItem): 'high' | 'medium' | 'low' {
    if (item.currentStock === 0) return 'high';
    if (item.currentStock <= item.minimumStock) return 'medium';
    return 'low';
  }

  async updateInventoryItem(productId: string, updates: Partial<InventoryItem>): Promise<void> {
    try {
      const docRef = doc(db, 'inventory', productId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService(); 