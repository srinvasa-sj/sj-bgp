import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageProps {
  imageUrl: string;
  name: string;
  isInWishlist: boolean;
  onAddToWishlist: () => void;
  hasActivePromotion: boolean;
}

const ProductImage = ({ 
  imageUrl, 
  name, 
  isInWishlist, 
  onAddToWishlist,
  hasActivePromotion 
}: ProductImageProps) => (
  <div className="relative group">
    <div className="overflow-hidden">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        onError={(e) => {
          console.error(`Error loading image for ${name}:`, e);
          const target = e.target as HTMLImageElement;
          target.src = "/placeholder.svg";
        }}
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

export default ProductImage;