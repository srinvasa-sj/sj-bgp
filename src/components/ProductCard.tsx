import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
}

const ProductCard = ({ id, name, price, image }: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`} className="product-card">
      <div className="overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="product-image"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-2">{name}</h3>
        <p className="text-lg font-semibold">${price.toFixed(2)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;