import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MATERIALS, PURITY_OPTIONS } from '@/constants/materials';

interface Product {
  productID: string; // productID cannot be edited
  productCategory: string;
  name: string;
  weight: number;
  imageUrls: string[];
  imageUrl?: string;
  purity: string; // purity should be editable based on material
  material: string; // material field added
  timestamp: string; // timestamp should be updated automatically
}

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [originalName, setOriginalName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().products) {
        setProducts(docSnap.data().products);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error loading products");
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setOriginalName(product.name);
    setEditingProduct({
      ...product,
      imageUrls: product.imageUrls || [product.imageUrl || ""],
      purity: product.purity || "",
      material: product.material || "", // Add material to the editing state
    });
  };

  const handleDelete = async (productName: string) => {
    try {
      const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
      const updatedProducts = products.filter((p) => p.name !== productName);
      await updateDoc(docRef, { products: updatedProducts });
      setProducts(updatedProducts);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product");
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    try {
      // Updating timestamp to the current date and time
      const updatedProduct = {
        ...editingProduct,
        timestamp: new Date().toISOString(),
        imageUrl: editingProduct.imageUrls[0], // Ensure imageUrl is the first in the array
      };

      const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
      const updatedProducts = products.map((p) =>
        p.productID === editingProduct.productID ? updatedProduct : p
      );

      await updateDoc(docRef, { products: updatedProducts });
      setProducts(updatedProducts);
      setEditingProduct(null);
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating product");
    }
  };

  const addImageUrl = () => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        imageUrls: [...editingProduct.imageUrls, ""]
      });
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    if (editingProduct) {
      const newImageUrls = [...editingProduct.imageUrls];
      newImageUrls[index] = value;
      setEditingProduct({ ...editingProduct, imageUrls: newImageUrls });
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8 bg-gradient-to-r from-gray-100 to-gray-300 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Product Management</h1>
        <Button variant="outline" onClick={() => navigate("/admin")} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white">
          <ArrowLeft className="h-5 w-5" /> Back to Admin
        </Button>
      </div>

      <div className="grid gap-6">
        {products.map((product) => (
          <div key={product.productID} className="p-6 bg-white rounded-lg shadow-lg flex items-center gap-6 transition-transform transform hover:scale-105">
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
              <img src={product.imageUrls?.[0] || product.imageUrl || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-semibold text-gray-700">{product.name}</h3>
              <p className="text-md text-gray-500">{product.productCategory} - {product.weight}g</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Edit className="h-5 w-5" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(product.name)} className="bg-red-500 hover:bg-red-600 text-white">
                <Trash2 className="h-5 w-5" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <Label>Product Category</Label>
            <Input value={editingProduct.productCategory} onChange={(e) => setEditingProduct({ ...editingProduct, productCategory: e.target.value })} />
            <Label>Name</Label>
            <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
            <Label>Weight (g)</Label>
            <Input type="number" value={editingProduct.weight} onChange={(e) => setEditingProduct({ ...editingProduct, weight: parseFloat(e.target.value) })} />
            <Label>Product Images</Label>
            {editingProduct.imageUrls.map((url, index) => (
              <Input key={index} type="url" value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} />
            ))}
            <Button type="button" onClick={addImageUrl} className="mt-2">Add Image</Button>

            {/* Material and Purity Fields */}
            <div className="mt-4">
              <Label>Material</Label>
              <Select 
                value={editingProduct.material} 
                onValueChange={(value) => setEditingProduct({ ...editingProduct, material: value, purity: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIALS.map((material) => (
                    <SelectItem key={material} value={material}>{material}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editingProduct.material && (
              <div className="space-y-2">
                <Label htmlFor="purity">Purity</Label>
                <Select 
                  value={editingProduct.purity} 
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, purity: value })}
                >
                <SelectTrigger>
                  <SelectValue placeholder="Select purity" />
                </SelectTrigger>
                <SelectContent>
                    {PURITY_OPTIONS[editingProduct.material as keyof typeof PURITY_OPTIONS].map((purity) => (
                      <SelectItem key={purity} value={purity}>{purity}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            )}

            {/* Disable productID and timestamp fields */}
            <Label>Product ID</Label>
            <Input value={editingProduct.productID} readOnly />
            <Label>Timestamp</Label>
            <Input value={editingProduct.timestamp} readOnly />

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

