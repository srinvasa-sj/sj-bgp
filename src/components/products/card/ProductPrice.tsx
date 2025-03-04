import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";

interface ProductPriceProps {
  showPrice: boolean;
  isLoading: boolean;
  originalPrice: number | null;
  promotionPrice: number | null;
  activePromotion: any;
  onCheckPrice: () => void;
  onView: () => void;
  productName: string;
  productID?: string;
}

const ProductPrice = ({
  showPrice,
  isLoading,
  originalPrice,
  promotionPrice,
  activePromotion,
  onCheckPrice,
  onView,
  productName,
  productID
}: ProductPriceProps) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleViewProduct = useCallback(async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    try {
      // Track the view first
      await onView();
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate(`/product/${encodeURIComponent(productName)}`);
      }, 100);
    } catch (error) {
      console.error('Error handling product view:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [navigate, onView, productName, isNavigating]);

  if (!showPrice) {
    return (
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={onCheckPrice}
          className="flex-1 bg-primary hover:bg-transparent/20"
          disabled={isLoading}
        >
          {isLoading ? "Calculating..." : "Check Price"}
        </Button>
        <Button 
          onClick={handleViewProduct}
          className="flex-1 text-white bg-primary hover:bg-transparent/20"
          variant="outline"
          disabled={isNavigating}
        >
          View Details
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        {promotionPrice ? (
          <>
            <p className="text-gray-500 line-through text-sm">
              Original Price: ₹{originalPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-2xl font-bold text-green-600">
              Offer Price: ₹{promotionPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            {activePromotion && (
              <div className="mt-2 space-y-1">
                <p className="text-primary font-semibold">{activePromotion.promotionName}</p>
                {activePromotion.giftDescription && (
                  <p className="text-green-600 text-sm">🎁 {activePromotion.giftDescription}</p>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-2xl font-bold text-primary">
            Price: ₹{originalPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        )}
      </div>
      
      <Button 
        onClick={handleViewProduct}
        className="w-full"
        variant="outline"
        disabled={isNavigating}
      >
        View Details
      </Button>
    </div>
  );
};

export default ProductPrice;
