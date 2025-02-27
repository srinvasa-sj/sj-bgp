import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { whatsappService } from './whatsappService';

class AutomatedNotificationService {
  private productListener: (() => void) | null = null;
  private promotionListener: (() => void) | null = null;

  // Start listening for new products
  startProductNotifications() {
    const productsRef = collection(db, 'products');
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);

    // Query for new products added in the last hour
    const q = query(
      productsRef,
      where('createdAt', '>=', Timestamp.fromDate(lastHour))
    );

    this.productListener = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const product = change.doc.data();
          await this.sendNewProductNotification(product);
        }
      });
    });
  }

  // Start listening for new promotions
  startPromotionNotifications() {
    const promotionsRef = collection(db, 'promotions');
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);

    const q = query(
      promotionsRef,
      where('createdAt', '>=', Timestamp.fromDate(lastHour))
    );

    this.promotionListener = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const promotion = change.doc.data();
          await this.sendNewPromotionNotification(promotion);
        }
      });
    });
  }

  // Stop listening for changes
  stopNotifications() {
    if (this.productListener) {
      this.productListener();
    }
    if (this.promotionListener) {
      this.promotionListener();
    }
  }

  // Send notification for new product
  private async sendNewProductNotification(product: any) {
    try {
      // Get all customers who opted for notifications
      const customersRef = collection(db, 'customers');
      const q = query(
        customersRef,
        where('notificationPreferences.newProducts', '==', true)
      );
      
      const customersSnapshot = await db.getDocs(q);
      
      // Create campaign for the new product
      const campaign = {
        name: `New Product - ${product.name}`,
        templateId: 'new_product_template', // You'll need to create this template
        schedule: {
          startDate: Timestamp.now(),
          endDate: Timestamp.now(),
          frequency: 'once' as const
        },
        targeting: {
          segments: ['all']
        },
        variables: {
          product_name: product.name,
          product_price: `₹${product.price.toLocaleString()}`,
          product_description: product.description || '',
          product_link: `https://yourwebsite.com/products/${product.id}`
        }
      };

      await whatsappService.createCampaign(campaign);
    } catch (error) {
      console.error('Error sending new product notification:', error);
    }
  }

  // Send notification for new promotion
  private async sendNewPromotionNotification(promotion: any) {
    try {
      // Get all customers who opted for notifications
      const customersRef = collection(db, 'customers');
      const q = query(
        customersRef,
        where('notificationPreferences.promotions', '==', true)
      );
      
      const customersSnapshot = await db.getDocs(q);
      
      // Create campaign for the new promotion
      const campaign = {
        name: `New Promotion - ${promotion.promotionName}`,
        templateId: 'new_promotion_template', // You'll need to create this template
        schedule: {
          startDate: Timestamp.now(),
          endDate: Timestamp.now(),
          frequency: 'once' as const
        },
        targeting: {
          segments: ['all']
        },
        variables: {
          promotion_name: promotion.promotionName,
          discount: promotion.priceDiscount ? `${promotion.priceDiscount}%` : '',
          valid_until: new Date(promotion.endDate).toLocaleDateString(),
          promotion_link: `https://yourwebsite.com/promotions/${promotion.id}`
        }
      };

      await whatsappService.createCampaign(campaign);
    } catch (error) {
      console.error('Error sending new promotion notification:', error);
    }
  }
}

export const automatedNotificationService = new AutomatedNotificationService(); 