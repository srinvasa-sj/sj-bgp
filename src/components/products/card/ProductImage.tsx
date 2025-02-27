import { useState } from 'react';
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/LazyImage";

interface ProductImageProps {
  imageUrl: string;
  name: string;
  isInWishlist: boolean;
  onAddToWishlist: () => void;
  hasActivePromotion: boolean;
  preloadUrls?: string[];
}

const ProductImage = ({ 
  imageUrl, 
  name, 
  isInWishlist, 
  onAddToWishlist,
  hasActivePromotion,
  preloadUrls = []
}: ProductImageProps) => {
  const [imageError, setImageError] = useState(false);
  const fallbackImage = "https://placehold.co/300x300/e2e8f0/1e293b?text=No+Image";

  const handleImageError = () => {
    console.log('Image failed to load:', imageUrl);
    setImageError(true);
  };

  return (
    <div className="relative group">
      <div className="overflow-hidden">
        <img
          src={imageError ? fallbackImage : imageUrl}
          alt={name}
          onError={handleImageError}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 ${
          isInWishlist ? 'text-red-500' : 'text-gray-500'
        }`}
        onClick={onAddToWishlist}
      >
        <Heart className="h-5 w-5" fill={isInWishlist ? "currentColor" : "none"} />
      </Button>
      {hasActivePromotion && (
        <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          Offer Deal! 🎁
        </div>
      )}
    </div>
  );
};

export default ProductImage;