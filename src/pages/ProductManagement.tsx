import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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
  productID: string;
  productCategory: string;
  name: string;
  weight: number;
  imageUrls: string[];
  imageUrl?: string;
  purity: string;
  material: string;
  timestamp?: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt?: string;
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
      const updatedProduct = {
        ...editingProduct,
        imageUrl: editingProduct.imageUrls[0], // Ensure imageUrl is the first in the array
        updatedAt: new Date().toISOString() // Add updatedAt field
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

      {editingProduct ? (
        // Edit Product Form Section
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </Button>
          </div>

          {/* Form Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Product Category</Label>
                <Input 
                  value={editingProduct.productCategory} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, productCategory: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Product Name</Label>
                <Input 
                  value={editingProduct.name} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Weight (g)</Label>
                <Input 
                  type="number" 
                  value={editingProduct.weight} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, weight: parseFloat(e.target.value) })}
                  className="mt-1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Material and Purity */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Material</Label>
                <Select 
                  value={editingProduct.material} 
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, material: value, purity: "" })}
                >
                  <SelectTrigger className="mt-1">
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
                <div>
                  <Label className="text-sm font-medium text-gray-700">Purity</Label>
                  <Select 
                    value={editingProduct.purity} 
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, purity: value })}
                  >
                    <SelectTrigger className="mt-1">
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
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Product Images</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageUrl}
                disabled={editingProduct.imageUrls.length >= 5}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Image
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {editingProduct.imageUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder={`Image URL ${index + 1}`}
                  />
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        const newUrls = [...editingProduct.imageUrls];
                        newUrls.splice(index, 1);
                        setEditingProduct({ ...editingProduct, imageUrls: newUrls });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Read-only Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <Label className="text-sm font-medium text-gray-700">Product ID</Label>
              <Input value={editingProduct.productID} readOnly className="mt-1 bg-gray-50" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Created At</Label>
              <Input 
                value={editingProduct.timestamp 
                  ? new Date(editingProduct.timestamp.seconds * 1000).toLocaleString()
                  : 'Not available'} 
                readOnly 
                className="mt-1 bg-gray-50"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
              <Input 
                value={editingProduct.updatedAt 
                  ? new Date(editingProduct.updatedAt).toLocaleString()
                  : 'Not modified'} 
                readOnly 
                className="mt-1 bg-gray-50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setEditingProduct(null)}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="px-4 bg-primary text-white hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        // Products List
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
      )}
    </div>
  );
};

export default ProductManagement;

