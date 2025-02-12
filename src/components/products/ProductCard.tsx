
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import ProductImage from "./card/ProductImage";
import ProductInfo from "./card/ProductInfo";
import ProductPrice from "./card/ProductPrice";

interface Product {
  name: string;
  productID?: string;
  productCategory: string;
  material?: string;
  purity?: string;
  weight: number;
  imageUrl: string;
}

interface Promotion {
  promotionName: string;
  giftDescription: string;
  priceDiscount: number;
  wastageDiscount: number;
  makingChargesDiscount: number;
}

interface ProductCardProps {
  product: Product;
  onAddToWishlist: (product: Product) => void;
  isInWishlist: boolean;
  activePromotion?: Promotion;
}

const ProductCard = ({ product, onAddToWishlist, isInWishlist, activePromotion }: ProductCardProps) => {
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [promotionPrice, setPromotionPrice] = useState<number | null>(null);
  const [showPrice, setShowPrice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const calculatePrices = async () => {
    setIsLoading(true);
    try {
      const priceDocRef = doc(db, "priceData", "OTjdBq7kTmGMXWDpMKvg");
      const priceDocSnap = await getDoc(priceDocRef);
      
      if (!priceDocSnap.exists()) {
        toast.error("Error: Price data not available");
        return;
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
        case "Fine Silver-99.9%":
          basePrice = priceData.priceSilver1;
          wastagePercentage = priceData.wastageChargesSilver;
          makingChargesPerGram = priceData.makingChargesSilver;
          break;
        case "Sterling Silver-92.5%":
          basePrice = priceData.priceSilver2;
          wastagePercentage = priceData.wastageChargesSilver;
          makingChargesPerGram = priceData.makingChargesSilver;
          break;
        default:
          toast.error("Error: Invalid product purity");
          return;
      }

      const baseAmount = basePrice * product.weight;
      let totalPrice = baseAmount;
      let wastageCharges = 0;
      let makingCharges = 0;

      if (applyWastageMakingCharges) {
        wastageCharges = baseAmount * (wastagePercentage / 100);
        makingCharges = makingChargesPerGram * product.weight;
        totalPrice = baseAmount + wastageCharges + makingCharges;
      }

      setOriginalPrice(totalPrice);

      // Calculate promotion price if active promotion exists
      if (activePromotion) {
        const discountedBasePrice = basePrice * (1 - activePromotion.priceDiscount / 100);
        const discountedWastage = applyWastageMakingCharges
          ? baseAmount * ((wastagePercentage * (1 - activePromotion.wastageDiscount / 100)) / 100)
          : 0;
        const discountedMaking = applyWastageMakingCharges
          ? makingChargesPerGram * (1 - activePromotion.makingChargesDiscount / 100) * product.weight
          : 0;

        const promotionalPrice = discountedBasePrice * product.weight + discountedWastage + discountedMaking;
        setPromotionPrice(promotionalPrice);
      }

    } catch (error) {
      console.error("Error calculating prices:", error);
      toast.error("Error calculating product prices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckPrice = () => {
    setShowPrice(true);
    calculatePrices();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-primary/20">
      <ProductImage
        imageUrl={product.imageUrl}
        name={product.name}
        isInWishlist={isInWishlist}
        onAddToWishlist={() => onAddToWishlist(product)}
        hasActivePromotion={!!activePromotion}
      />
      <div className="p-6">
        <ProductInfo
          name={product.name}
          productID={product.productID}
          category={product.productCategory}
          material={product.material}
          purity={product.purity}
          weight={product.weight}
        />
        <ProductPrice
          showPrice={showPrice}
          isLoading={isLoading}
          originalPrice={originalPrice}
          promotionPrice={promotionPrice}
          activePromotion={activePromotion}
          onCheckPrice={handleCheckPrice}
          productName={product.name}
          productID={product.productID}
        />
      </div>
    </div>
  );
};

export default ProductCard;
