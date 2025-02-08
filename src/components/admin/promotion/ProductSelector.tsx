import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Product {
  name: string;
  category: string;
  weight: number;
  imageUrl: string;
}

interface ProductSelectorProps {
  products: Product[];
  selectedProducts: string[];
  onProductSelect: (productName: string) => void;
}

const ProductSelector = ({ products, selectedProducts, onProductSelect }: ProductSelectorProps) => (
  <div className="space-y-2">
    <Label>Select Products</Label>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {products.map((product) => (
        <Button
          key={product.name}
          type="button"
          variant={selectedProducts.includes(product.name) ? "default" : "outline"}
          className="text-sm"
          onClick={() => onProductSelect(product.name)}
        >
          {product.name}
        </Button>
      ))}
    </div>
  </div>
);

export default ProductSelector;