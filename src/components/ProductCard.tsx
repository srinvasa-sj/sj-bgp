import { Heart, ZoomIn } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface ProductCardProps {
  title: string;
  price: number;
  image: string;
  category: string;
}

const ProductCard = ({ title, price, image, category }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:border-foreground/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-muted relative">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="icon" className="mr-2">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight line-clamp-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{category}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold">₹{price.toLocaleString()}</p>
          <Button size="sm">Add to Cart</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;