import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface Product {
  purity?: string;
  weight: number;
}

interface Promotion {
  priceDiscount: number;
  wastageDiscount: number;
  makingChargesDiscount: number;
}

export const calculateProductPrice = async (product: Product): Promise<number> => {
  if (!product.purity) {
    throw new Error("Product purity is required for price calculation");
  }

  const priceDocRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
  const priceDocSnap = await getDoc(priceDocRef);
  
  if (!priceDocSnap.exists()) {
    throw new Error("Price data not available");
  }

  const priceData = priceDocSnap.data();
  let basePrice = 0;
  let wastagePercentage = 0;
  let makingChargesPerGram = 0;
  let applyWastageMakingCharges = true;

  switch (product.purity) {
    case "18 Karat":
      basePrice = priceData.price18Karat;
      wastagePercentage = priceData.goldwastageCharges;
      makingChargesPerGram = priceData.goldmakingCharges;
      break;
    case "20 Karat":
      basePrice = priceData.price20Karat;
      wastagePercentage = priceData.goldwastageCharges;
      makingChargesPerGram = priceData.goldmakingCharges;
      break;
    case "22 Karat":
      basePrice = priceData.price22Karat;
      wastagePercentage = priceData.goldwastageCharges;
      makingChargesPerGram = priceData.goldmakingCharges;
      break;
    case "24 Karat":
      basePrice = priceData.price24Karat;
      applyWastageMakingCharges = false;
      break;
    case "Silver 999":
      basePrice = priceData.priceSilver999;
      wastagePercentage = priceData.wastageChargesSilver;
      makingChargesPerGram = priceData.makingChargesSilver;
      break;
    case "Silver 925":
      basePrice = priceData.priceSilver925;
      wastagePercentage = priceData.wastageChargesSilver;
      makingChargesPerGram = priceData.makingChargesSilver;
      break;
    default:
      throw new Error("Invalid product purity");
  }

  const baseAmount = basePrice * product.weight;
  let totalPrice = baseAmount;

  if (applyWastageMakingCharges) {
    const wastageCharges = baseAmount * (wastagePercentage / 100);
    const makingCharges = makingChargesPerGram * product.weight;
    totalPrice = baseAmount + wastageCharges + makingCharges;
  }

  return totalPrice;
};

export const calculatePromotionPrice = (basePrice: number, promotion: Promotion): number => {
  // Get base amount (70% of total price for typical jewelry)
  const baseAmount = basePrice * 0.7;
  
  // Get wastage charges (20% of total price)
  const wastageCharges = basePrice * 0.2;
  
  // Get making charges (10% of total price)
  const makingCharges = basePrice * 0.1;

  // Apply respective discounts to each component
  const discountedBaseAmount = baseAmount * (1 - (promotion.priceDiscount / 100));
  const discountedWastageCharges = wastageCharges * (1 - (promotion.wastageDiscount / 100));
  const discountedMakingCharges = makingCharges * (1 - (promotion.makingChargesDiscount / 100));

  // Sum up all discounted components
  return discountedBaseAmount + discountedWastageCharges + discountedMakingCharges;
}; 
