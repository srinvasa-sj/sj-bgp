import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Interfaces
interface WhatsAppTemplate {
  id?: string;
  name: string;
  language: string;
  category: 'marketing' | 'transactional' | 'service';
  components: Array<{
    type: 'header' | 'body' | 'footer' | 'button';
    text: string;
    format?: 'text' | 'image' | 'document' | 'video';
    example?: string;
    variables?: string[];
  }>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  message: string;
  imageUrl?: string;
  imageUrls?: string[];
}

// New interface for simple template messages
interface WhatsAppTemplateMessage {
  message: string;
  imageUrl?: string;
  imageUrls?: string[];
}

interface WhatsAppMessage {
  id?: string;
  templateId: string;
  recipientPhone: string;
  variables: { [key: string]: string };
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  error?: string;
  campaignId?: string;
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  readAt?: Timestamp;
}

interface WhatsAppCampaign {
  id?: string;
  name: string;
  templateId: string;
  schedule: {
    startDate: Timestamp;
    endDate: Timestamp;
    frequency?: 'once' | 'daily' | 'weekly';
    timeOfDay?: string;
  };
  targeting: {
    segments: string[];
    filters?: {
      lastPurchaseDate?: Timestamp;
      minimumTotalSpent?: number;
    };
  };
  variables: {
    [key: string]: string | ((customer: any) => string);
  };
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  metrics: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    responded: number;
  };
}

interface Customer {
  id: string;
  phone: string;
  // Add other customer fields as needed
}

const formatWhatsAppUrl = (phone: string, text: string) => {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

class WhatsAppService {
  private readonly WHATSAPP_BUSINESS_PHONE = import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE;
  private readonly WHATSAPP_API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY;
  private readonly WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';

  // Template Management
  async createTemplate(template: Omit<WhatsAppTemplate, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = Timestamp.now();
      const newTemplate = {
        ...template,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'whatsappTemplates'), newTemplate);
      return {
        id: docRef.id,
        ...newTemplate
      };
    } catch (error) {
      console.error('Error creating WhatsApp template:', error);
      throw error;
    }
  }

  async updateTemplate(id: string, updates: Partial<WhatsAppTemplate>) {
    try {
      const templateRef = doc(db, 'whatsappTemplates', id);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      const updated = await getDoc(templateRef);
      return {
        id: updated.id,
        ...updated.data()
      };
    } catch (error) {
      console.error('Error updating WhatsApp template:', error);
      throw error;
    }
  }

  async getActiveTemplates() {
    try {
      const templatesQuery = query(
        collection(db, 'whatsappTemplates'),
        where('status', '==', 'approved')
      );

      const snapshot = await getDocs(templatesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WhatsAppTemplate[];
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      throw error;
    }
  }

  // Message Sending
  async sendMessage(message: Omit<WhatsAppMessage, 'id' | 'status' | 'sentAt' | 'deliveredAt' | 'readAt'>) {
    try {
        const template = await this.getTemplate(message.templateId);
        if (!template) {
          throw new Error('Template not found');
        }

        // Prepare message content
        const messageContent = this.prepareMessageContent(template, message.variables);

        // Send message via WhatsApp Business API
        const response = await this.sendToWhatsAppAPI({
        messaging_product: "whatsapp",
          to: message.recipientPhone,
        type: "template",
          template: {
            name: template.name,
          language: {
            code: template.language
          },
            components: messageContent
          }
        });

        // Record message in database
        const messageDoc = {
          ...message,
          status: 'sent',
          sentAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'whatsappMessages'), messageDoc);
      
      // Set up webhook for status updates
      this.setupWebhook(docRef.id);

        return {
          id: docRef.id,
          ...messageDoc
        };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  private async sendToWhatsAppAPI(payload: any) {
    try {
      const response = await fetch(`${this.WHATSAPP_API_URL}/${this.WHATSAPP_BUSINESS_PHONE}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhatsApp API error: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling WhatsApp API:', error);
      throw error;
    }
  }

  private async getTemplate(templateId: string): Promise<WhatsAppTemplate | null> {
    try {
      const templateDoc = await getDoc(doc(db, 'whatsappTemplates', templateId));
      if (!templateDoc.exists()) {
        return null;
      }
      return {
        id: templateDoc.id,
        ...templateDoc.data()
      } as WhatsAppTemplate;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  private prepareMessageContent(template: WhatsAppTemplate, variables: { [key: string]: string }) {
    return template.components.map(component => {
      let text = component.text;
      component.variables?.forEach(variable => {
        text = text.replace(`{{${variable}}}`, variables[variable] || '');
      });
      return {
        type: component.type,
        text
      };
    });
  }

  // Campaign Management
  async createCampaign(campaign: Omit<WhatsAppCampaign, 'id' | 'metrics'>) {
    try {
      // Get target customers
      const customers = await this.getTargetCustomers(campaign.targeting);
      
      const newCampaign = {
        ...campaign,
        metrics: {
          total: customers.length,
          sent: 0,
          delivered: 0,
          read: 0,
          responded: 0
        }
      };

      const docRef = await addDoc(collection(db, 'whatsappCampaigns'), newCampaign);

      // Send messages to all target customers
      for (const customer of customers) {
        try {
          const variables = this.resolveVariables(campaign.variables, customer);
          
          await this.sendMessage({
            templateId: campaign.templateId,
            recipientPhone: customer.phone,
            variables,
            campaignId: docRef.id
          });

          // Update sent metric
          await this.updateCampaignMetrics(docRef.id, {
            sent: newCampaign.metrics.sent + 1
          });
        } catch (error) {
          console.error(`Error sending campaign message to ${customer.phone}:`, error);
        }
      }

      return {
        id: docRef.id,
        ...newCampaign
      };
    } catch (error) {
      console.error('Error creating WhatsApp campaign:', error);
      throw error;
    }
  }

  private setupWebhook(messageId: string) {
    // This would be implemented on your backend to receive WhatsApp status updates
    // The webhook URL should be configured in your WhatsApp Business API settings
    console.log(`Webhook setup for message ${messageId}`);
  }

  async updateCampaignMetrics(campaignId: string, updates: Partial<WhatsAppCampaign['metrics']>) {
    try {
      const campaignRef = doc(db, 'whatsappCampaigns', campaignId);
      const campaign = await getDoc(campaignRef);
      
      if (!campaign.exists()) {
        throw new Error('Campaign not found');
      }

      const currentMetrics = campaign.data()?.metrics || {
        total: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        responded: 0
      };

      await updateDoc(campaignRef, {
        metrics: {
          ...currentMetrics,
          ...updates
        }
      });
    } catch (error) {
      console.error('Error updating campaign metrics:', error);
      throw error;
    }
  }

  async executeCampaign(campaignId: string) {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get target customers
      const customers = await this.getTargetCustomers(campaign.targeting);

      // Update total metric
      await this.updateCampaignMetrics(campaignId, {
        total: customers.length
      });

      // Send messages to all target customers
      for (const customer of customers) {
        try {
          const variables = this.resolveVariables(campaign.variables, customer);
          
          await this.sendMessage({
            templateId: campaign.templateId,
            recipientPhone: customer.phone,
            variables,
            campaignId
          });

          // Update sent metric
          await this.updateCampaignMetrics(campaignId, {
            sent: campaign.metrics.sent + 1
          });
        } catch (error) {
          console.error(`Error sending campaign message to ${customer.phone}:`, error);
        }
      }

      // Update campaign status
      await updateDoc(doc(db, 'whatsappCampaigns', campaignId), {
        status: 'completed'
      });
    } catch (error) {
      console.error('Error executing WhatsApp campaign:', error);
      throw error;
    }
  }

  private async getCampaign(campaignId: string): Promise<WhatsAppCampaign | null> {
    try {
      const campaignDoc = await getDoc(doc(db, 'whatsappCampaigns', campaignId));
      if (!campaignDoc.exists()) {
        return null;
      }
      return {
        id: campaignDoc.id,
        ...campaignDoc.data()
      } as WhatsAppCampaign;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  }

  private async getTargetCustomers(targeting: WhatsAppCampaign['targeting']): Promise<Customer[]> {
    try {
      let customersQuery = query(collection(db, 'customers'));

      // Apply segment filter
      if (targeting.segments.length > 0) {
        customersQuery = query(
          customersQuery,
          where('segments', 'array-contains-any', targeting.segments)
        );
      }

      // Apply additional filters
      if (targeting.filters) {
        if (targeting.filters.lastPurchaseDate) {
          customersQuery = query(
            customersQuery,
            where('lastPurchaseDate', '>=', targeting.filters.lastPurchaseDate)
          );
        }
        if (targeting.filters.minimumTotalSpent) {
          customersQuery = query(
            customersQuery,
            where('totalSpent', '>=', targeting.filters.minimumTotalSpent)
          );
        }
      }

      const snapshot = await getDocs(customersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
    } catch (error) {
      console.error('Error fetching target customers:', error);
      throw error;
    }
  }

  private resolveVariables(
    variables: WhatsAppCampaign['variables'],
    customer: any
  ): { [key: string]: string } {
    const resolved: { [key: string]: string } = {};
    
    Object.entries(variables).forEach(([key, value]) => {
      if (typeof value === 'function') {
        resolved[key] = value(customer);
      } else {
        resolved[key] = value;
      }
    });

    return resolved;
  }

  // Message Status Updates
  async updateMessageStatus(messageId: string, status: WhatsAppMessage['status'], timestamp?: Date) {
    try {
      const messageRef = doc(db, 'whatsappMessages', messageId);
      const updates: any = { status };

      if (timestamp) {
        switch (status) {
          case 'delivered':
            updates.deliveredAt = Timestamp.fromDate(timestamp);
            break;
          case 'read':
            updates.readAt = Timestamp.fromDate(timestamp);
            break;
        }
      }

      await updateDoc(messageRef, updates);

      // Update campaign metrics if message is part of a campaign
      const message = await getDoc(messageRef);
      if (message.exists() && message.data()?.campaignId) {
        const campaignId = message.data()?.campaignId;
        const metricKey = status === 'delivered' ? 'delivered' : 
                         status === 'read' ? 'read' : null;
        
        if (metricKey) {
          const campaign = await this.getCampaign(campaignId);
          if (campaign) {
            await this.updateCampaignMetrics(campaignId, {
              [metricKey]: campaign.metrics[metricKey] + 1
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }

  // Update the template sending functionality
  async sendTemplate(template: WhatsAppTemplateMessage) {
    try {
      // First, send the images if available
      if (template.imageUrls && template.imageUrls.length > 0) {
        // Open a new window for each image
        template.imageUrls.forEach(imageUrl => {
          window.open(formatWhatsAppUrl('', `${imageUrl}`), '_blank');
        });
      } else if (template.imageUrl) {
        window.open(formatWhatsAppUrl('', `${template.imageUrl}`), '_blank');
      }

      // Then send the message text
      setTimeout(() => {
        window.open(formatWhatsAppUrl('', template.message), '_blank');
      }, 500); // Small delay to ensure images are sent first
      
      return { success: true };
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      throw new Error('Failed to send WhatsApp template');
    }
  }
}

// Export a single instance of the service
export const whatsappService = new WhatsAppService();