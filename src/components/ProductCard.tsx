import { Heart } from "lucide-react";
import { Button } from "./ui/button";

interface ProductCardProps {
  title: string;
  price: number;
  image: string;
  category: string;
}

const ProductCard = ({ title, price, image, category }: ProductCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:border-foreground/20">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="mt-2 text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{category}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold">₹{price.toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="sm">Add to Cart</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;