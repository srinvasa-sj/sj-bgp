import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import ProductImage from "./card/ProductImage";
import ProductInfo from "./card/ProductInfo";
import ProductPrice from "./card/ProductPrice";
import { calculateProductPrice, calculatePromotionPrice } from '@/utils/priceCalculator';

interface Product {
  name: string;
  productID?: string;
  productCategory: string;
  material?: string;
  purity?: string;
  weight: number;
  imageUrl: string;
  viewCount?: number;
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
  onView?: () => void;
  isTrending?: boolean;
}

const ProductCard = ({ 
  product, 
  onAddToWishlist, 
  isInWishlist, 
  activePromotion,
  onView,
  isTrending 
}: ProductCardProps) => {
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [promotionPrice, setPromotionPrice] = useState<number | null>(null);
  const [showPrice, setShowPrice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const priceCalculationInProgress = useRef(false);
  const productRef = useRef(product.productID);

  useEffect(() => {
    if (productRef.current !== product.productID) {
      setOriginalPrice(null);
      setPromotionPrice(null);
      setShowPrice(false);
      setIsLoading(false);
      priceCalculationInProgress.current = false;
      productRef.current = product.productID;
    }
  }, [product]);

  const handleCheckPrice = useCallback(async () => {
    if (!product || priceCalculationInProgress.current) return;
    
    try {
      priceCalculationInProgress.current = true;
      setIsLoading(true);

      if (!product.purity) {
        toast.error('Product purity is required for price calculation');
        return;
      }

      // Calculate original price
      const basePrice = await calculateProductPrice({
        purity: product.purity,
        weight: product.weight
      });

      // Calculate promotion price if there's an active promotion
      let discountedPrice = null;
      if (activePromotion) {
        discountedPrice = calculatePromotionPrice(basePrice, activePromotion);
      }

      // Update states in a batch to prevent flickering
      setOriginalPrice(basePrice);
      setPromotionPrice(discountedPrice);
      setShowPrice(true);

    } catch (error) {
      console.error('Error calculating price:', error);
      toast.error('Failed to calculate price. Please try again.');
    } finally {
      setIsLoading(false);
      priceCalculationInProgress.current = false;
    }
  }, [product, activePromotion]);

  const handleProductView = useCallback(async () => {
    if (onView && product.productID) {
      await onView();
    }
  }, [onView, product.productID]);

  if (!product) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-primary/20">
      <div className="relative">
        {isTrending && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center space-x-1 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span>Trending{product.viewCount ? ` • ${product.viewCount} views` : ''}</span>
          </div>
        )}
        
        <ProductImage
          imageUrl={product.imageUrl}
          name={product.name}
          isInWishlist={isInWishlist}
          onAddToWishlist={() => onAddToWishlist(product)}
          hasActivePromotion={!!activePromotion}
        />
      </div>
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
          onView={handleProductView}
          productName={product.name}
          productID={product.productID}
        />
      </div>
    </div>
  );
};

export default ProductCard;
