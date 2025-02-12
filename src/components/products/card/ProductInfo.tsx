
interface ProductInfoProps {
  name: string;
  productID?: string;
  productCategory?: string;
  material?: string;
  purity?: string;
  weight: number;
  category?: string; // Added this line to fix the error
}

const ProductInfo = ({ name, productID, productCategory, material, purity, weight, category }: ProductInfoProps) => (
  <div className="space-y-1">
    <h3 className="text-xl font-semibold">{name}</h3>
    {productID && <p className="text-sm text-gray-500">Product ID: {productID}</p>}
    {(productCategory || category) && <p className="text-sm text-gray-600">Category: {productCategory || category}</p>}
    {material && purity && <p className="text-sm text-gray-600">{material} - {purity}</p>}
    <p className="text-sm text-gray-600">Weight: {weight}g</p>
  </div>
);

export default ProductInfo;
