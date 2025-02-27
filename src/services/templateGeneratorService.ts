import { TEMPLATE_IMAGES } from '@/constants/templateImages';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Configuration for website and contact info
const WEBSITE_CONFIG = {
  baseUrl: 'https://srinivasajewellers-bgp.web.app',
  contactNumber: '+91 1234567890',
  storeAddress: 'SJ Jewellers, Main Street, City',
  whatsappNumber: '+91 1234567890'
};

interface ProductData {
  id: string;
  name: string;
  price?: number;
  description?: string;
  category?: string;
  productCategory?: string;
  material?: string;
  weight?: number;
  imageUrl?: string;
  purity?: string;
  design?: string;
  originalPrice?: number;
  discountedPrice?: number;
  activePromotion?: boolean;
  priceDisplay?: string;
}

interface PromotionData {
  id: string;
  promotionName: string;
  description?: string;
  priceDiscount: number;
  wastageDiscount: number;
  makingChargesDiscount: number;
  giftDescription?: string;
  startDate: string;
  endDate: string;
  productName: string;
  imageUrl?: string;
  mainProduct?: ProductData;
  popularProducts?: ProductData[];
}

interface TemplateResponse {
  message: string;
  imageUrl?: string;
  imageUrls?: string[];
}

// Helper functions for template generation
const formatPrice = (product: ProductData): string => {
  if (!product.price && product.price !== 0) {
    return '*Price:* Contact for best price 📞';
  }
  
  if (product.priceDisplay) {
    return `*Price:* ${product.priceDisplay} 📞`;
  }
  
  return '*Price:* Contact for best price 📞';
};

const formatProductDetails = (product: ProductData): string => {
  const details = [];
  
  if (product.category) details.push(`*Category:* ${product.category}`);
  if (product.material) details.push(`*Material:* ${product.material}`);
  if (product.purity) details.push(`*Purity:* ${product.purity}`);
  if (product.design) details.push(`*Design:* ${product.design}`);
  if (product.weight) details.push(`*Weight:* ${product.weight}g`);
  
  return details.length > 0 ? details.join('\n') : 'Contact us for product details';
};

const getProductUrl = (productId: string): string => {
  return `${WEBSITE_CONFIG.baseUrl}/products/${productId}`;
};

const getCategoryUrl = (category: string): string => {
  return `${WEBSITE_CONFIG.baseUrl}/products?category=${encodeURIComponent(category)}`;
};

// Template generation functions
const generateProductTemplate = async (data: ProductData): Promise<TemplateResponse> => {
  try {
    if (!data || !data.id || !data.name) {
      throw new Error('Invalid product data');
    }

    const template = `*✨ New Arrival Alert ✨*

*${data.name}*

${data.description ? `_${data.description}_\n` : ''}

${formatPrice(data)}

*Product Details:*
${formatProductDetails(data)}

*Shop Now* 🛍️
${getProductUrl(data.id)}

*Contact Us* 📱
📞 *Call:* ${WEBSITE_CONFIG.contactNumber}
💬 *WhatsApp:* ${WEBSITE_CONFIG.whatsappNumber}
🏪 *Visit:* ${WEBSITE_CONFIG.storeAddress}

_Limited Stock Available_ ⌛
_Make it yours today!_ 💝`;

  return {
    message: template,
      imageUrl: data.imageUrl,
      imageUrls: data.imageUrl ? [data.imageUrl] : []
    };
  } catch (error) {
    console.error('Error generating product template:', error);
    throw new Error('Failed to generate product template');
  }
};

const generateCategoryTemplate = async (data: { category: string; products: ProductData[] }): Promise<TemplateResponse> => {
  try {
    const productsList = data.products.slice(0, 6).map((product, index) => `
*${index + 1}. ${product.name}*
${formatProductDetails(product)}
🛍️ *Shop:* ${getProductUrl(product.id)}`).join('\n\n');

    const template = `*✨ ${data.category} Collection ✨*

*Featured Products from ${data.category}* 🌟

${productsList}

*Browse More ${data.category}* 🔍
• *New Arrivals:* ${getCategoryUrl(data.category)}&sort=newest
• *All ${data.category}:* ${getCategoryUrl(data.category)}

*Contact Us* 📱
📞 *Call:* ${WEBSITE_CONFIG.contactNumber}
💬 *WhatsApp:* ${WEBSITE_CONFIG.whatsappNumber}
🏪 *Visit:* ${WEBSITE_CONFIG.storeAddress}

_Explore Our ${data.category} Collection Today_ ✨`;

    const imageUrls = data.products.filter(p => p.imageUrl).map(p => p.imageUrl) as string[];
  return {
    message: template,
      imageUrl: data.products[0]?.imageUrl,
      imageUrls
    };
  } catch (error) {
    console.error('Error generating category template:', error);
    throw new Error('Failed to generate category template');
  }
};

const generatePromotionalTemplate = async (data: { product: ProductData; promotion: PromotionData }): Promise<TemplateResponse> => {
  try {
    if (!data.product || !data.promotion) {
      throw new Error('Invalid promotional data: Missing product or promotion details');
    }

    const template = `*✨ Special Offer ✨*

*${data.product.name}*
${data.product.description ? `_${data.product.description}_\n` : ''}

${data.promotion.description ? `*${data.promotion.description}*\n` : ''}
*Price:* Contact for best price 📞

${formatProductDetails(data.product)}

*Shop Now* 🛍️
${getProductUrl(data.product.id)}

*Contact Us* 📱
📞 *Call:* ${WEBSITE_CONFIG.contactNumber}
💬 *WhatsApp:* ${WEBSITE_CONFIG.whatsappNumber}
🏪 *Visit:* ${WEBSITE_CONFIG.storeAddress}

_Limited Time Offer!_ ⏰
_Don't miss out on this amazing deal!_ ✨`;

    const defaultImage = TEMPLATE_IMAGES.promotion[Math.floor(Math.random() * TEMPLATE_IMAGES.promotion.length)];
    const imageUrl = data.product.imageUrl || defaultImage;
  return {
    message: template,
      imageUrl,
      imageUrls: [imageUrl]
    };
  } catch (error) {
    console.error('Error generating promotional template:', error);
    throw new Error('Failed to generate promotional template');
  }
};

const generateMultipleProductsTemplate = async (data: { products: ProductData[] }): Promise<TemplateResponse> => {
  try {
    if (!data.products || data.products.length === 0) {
      throw new Error('No products provided');
    }

    const productsList = data.products.map((product, index) => `
*${index + 1}. ${product.name}*
${product.description ? `_${product.description}_\n` : ''}
${formatProductDetails(product)}
🛍️ *Shop Now:* ${getProductUrl(product.id)}`).join('\n\n');

    const template = `*✨ Featured Collection ✨*

${productsList}

*Browse More* 🔍
• *New Arrivals:* ${WEBSITE_CONFIG.baseUrl}/products?sort=newest
• *All Products:* ${WEBSITE_CONFIG.baseUrl}/products

*Contact Us* 📱
📞 *Call:* ${WEBSITE_CONFIG.contactNumber}
💬 *WhatsApp:* ${WEBSITE_CONFIG.whatsappNumber}
🏪 *Visit:* ${WEBSITE_CONFIG.storeAddress}

_Limited Time Offer_ ⌛
_Don't miss these amazing pieces!_ 🌟`;

    const imageUrls = data.products.filter(p => p.imageUrl).map(p => p.imageUrl) as string[];
  return {
    message: template,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : undefined,
      imageUrls
    };
  } catch (error) {
    console.error('Error generating multiple products template:', error);
    throw new Error('Failed to generate multiple products template');
  }
};

// Update the main generateTemplate function
export const templateGeneratorService = {
  generateTemplate: async (type: string, data: any): Promise<TemplateResponse> => {
    try {
    switch (type) {
      case 'product':
          return await generateProductTemplate(data);
        case 'category':
          return await generateCategoryTemplate(data);
      case 'promotion':
          return await generatePromotionalTemplate(data);
      case 'multiple_products':
          return await generateMultipleProductsTemplate(data);
      default:
          throw new Error(`Unknown template type: ${type}`);
      }
    } catch (error) {
      console.error('Error generating template:', error);
      throw error;
    }
  }
};