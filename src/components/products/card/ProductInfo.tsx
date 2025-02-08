interface ProductInfoProps {
  name: string;
  category: string;
  weight: number;
}

const ProductInfo = ({ name, category, weight }: ProductInfoProps) => (
  <div>
    <h3 className="text-xl font-semibold mb-2">{name}</h3>
    <p className="text-gray-600">Category: {category}</p>
    <p className="text-gray-600">Weight: {weight}g</p>
  </div>
);

export default ProductInfo;