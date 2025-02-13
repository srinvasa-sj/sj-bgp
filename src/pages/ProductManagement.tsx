// import { useState, useEffect } from "react";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Edit, Trash2, ArrowLeft, Plus, Image as ImageIcon } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// interface Product {
//   productCategory: string;
//   name: string;
//   weight: number;
//   imageUrls: string[];
//   imageUrl?: string; // For backward compatibility
// }

// const ProductManagement = () => {
//   const navigate = useNavigate();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [originalName, setOriginalName] = useState<string>("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       console.log("Fetching products...");
//       const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
//       const docSnap = await getDoc(docRef);
      
//       if (docSnap.exists() && docSnap.data().products) {
//         const productsData = docSnap.data().products;
//         console.log("Products fetched:", productsData);
//         setProducts(productsData);
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       toast.error("Error loading products");
//       setLoading(false);
//     }
//   };

//   const handleEdit = (product: Product) => {
//     console.log("Editing product:", product);
//     setOriginalName(product.name); // Store original name for updating
//     setEditingProduct({
//       ...product,
//       imageUrls: product.imageUrls || [product.imageUrl || ""],
//     });
//   };

//   const handleDelete = async (productName: string) => {
//     try {
//       const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
//       const updatedProducts = products.filter(p => p.name !== productName);
//       await updateDoc(docRef, {
//         products: updatedProducts
//       });
//       setProducts(updatedProducts);
//       toast.success("Product deleted successfully");
//     } catch (error) {
//       console.error("Error deleting product:", error);
//       toast.error("Error deleting product");
//     }
//   };

//   const handleUpdate = async (updatedProduct: Product) => {
//     try {
//       console.log("Updating product:", updatedProduct);
//       const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
//       const updatedProducts = products.map(p => 
//         p.name === originalName ? {
//           ...updatedProduct,
//           imageUrl: updatedProduct.imageUrls[0], // Maintain backward compatibility
//         } : p
//       );
//       await updateDoc(docRef, {
//         products: updatedProducts
//       });
//       setProducts(updatedProducts);
//       setEditingProduct(null);
//       toast.success("Product updated successfully");
//     } catch (error) {
//       console.error("Error updating product:", error);
//       toast.error("Error updating product");
//     }
//   };

//   const addImageUrl = () => {
//     if (editingProduct) {
//       setEditingProduct({
//         ...editingProduct,
//         imageUrls: [...editingProduct.imageUrls, ""]
//       });
//     }
//   };

//   const removeImageUrl = (index: number) => {
//     if (editingProduct && editingProduct.imageUrls.length > 1) {
//       const newImageUrls = editingProduct.imageUrls.filter((_, i) => i !== index);
//       setEditingProduct({
//         ...editingProduct,
//         imageUrls: newImageUrls
//       });
//     }
//   };

//   const handleImageUrlChange = (index: number, value: string) => {
//     if (editingProduct) {
//       const newImageUrls = [...editingProduct.imageUrls];
//       newImageUrls[index] = value;
//       setEditingProduct({
//         ...editingProduct,
//         imageUrls: newImageUrls
//       });
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold">Product Management</h1>
//         <Button variant="outline" onClick={() => navigate("/admin")} className="flex items-center gap-2">
//           <ArrowLeft className="h-4 w-4" />
//           Back to Admin
//         </Button>
//       </div>

//       <div className="grid gap-6">
//         {products.map((product) => (
//           <div key={product.name} className="glassy-card flex items-center gap-6">
//             <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100">
//               {product.imageUrls?.[0] || product.imageUrl ? (
//                 <img 
//                   src={product.imageUrls?.[0] || product.imageUrl}
//                   alt={product.name}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     const target = e.target as HTMLImageElement;
//                     target.src = "/placeholder.svg";
//                   }}
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center">
//                   <ImageIcon className="w-8 h-8 text-gray-400" />
//                 </div>
//               )}
//             </div>
            
//             <div className="flex-grow space-y-2">
//               <h3 className="text-xl font-semibold">{product.name}</h3>
//               <p className="text-sm text-muted-foreground">
//                 {product.productCategory} - {product.weight}g
//               </p>
//             </div>
            
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handleEdit(product)}
//                 className="flex items-center gap-2"
//               >
//                 <Edit className="h-4 w-4" />
//                 Edit
//               </Button>
//               <Button
//                 variant="destructive"
//                 size="sm"
//                 onClick={() => handleDelete(product.name)}
//                 className="flex items-center gap-2"
//               >
//                 <Trash2 className="h-4 w-4" />
//                 Delete
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {editingProduct && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//           <div className="glassy-container max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleUpdate(editingProduct);
//               }}
//               className="space-y-6"
//             >
//               <div>
//                 <Label>Product Category</Label>
//                 <Select
//                   value={editingProduct.productCategory}
//                   onValueChange={(value) =>
//                     setEditingProduct({ ...editingProduct, productCategory: value })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Product Category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="24 Karat">24 Karat</SelectItem>
//                     <SelectItem value="22 Karat">22 Karat</SelectItem>
//                     <SelectItem value="20 Karat">20 Karat</SelectItem>
//                     <SelectItem value="18 Karat">18 Karat</SelectItem>
//                     <SelectItem value="Silver 1">Silver 1</SelectItem>
//                     <SelectItem value="Silver 2">Silver 2</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Name</Label>
//                 <Input
//                   value={editingProduct.name}
//                   onChange={(e) =>
//                     setEditingProduct({ ...editingProduct, name: e.target.value })
//                   }
//                 />
//               </div>

//               <div>
//                 <Label>Weight (g)</Label>
//                 <Input
//                   type="number"
//                   value={editingProduct.weight}
//                   onChange={(e) =>
//                     setEditingProduct({
//                       ...editingProduct,
//                       weight: parseFloat(e.target.value),
//                     })
//                   }
//                   step="0.001"
//                 />
//               </div>

//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <Label>Product Images</Label>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={addImageUrl}
//                     className="flex items-center gap-2"
//                   >
//                     <Plus className="h-4 w-4" />
//                     Add Image
//                   </Button>
//                 </div>
//                 {editingProduct.imageUrls.map((url, index) => (
//                   <div key={index} className="flex gap-2 items-center">
//                     <div className="flex-grow">
//                       <Input
//                         type="url"
//                         value={url}
//                         onChange={(e) => handleImageUrlChange(index, e.target.value)}
//                         placeholder="Enter image URL"
//                         required={index === 0}
//                       />
//                     </div>
//                     {index > 0 && (
//                       <Button
//                         type="button"
//                         variant="destructive"
//                         size="icon"
//                         onClick={() => removeImageUrl(index)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="flex gap-2 justify-end pt-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setEditingProduct(null)}
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit">Save Changes</Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductManagement;

//---------------------------------------------- previous correct code--------------//
// import { useState, useEffect } from "react";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Edit, Trash2, ArrowLeft, Plus } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// interface Product {
//   productCategory: string;
//   name: string;
//   weight: number;
//   imageUrls: string[];
//   imageUrl?: string;
// }

// const ProductManagement = () => {
//   const navigate = useNavigate();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [originalName, setOriginalName] = useState<string>("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists() && docSnap.data().products) {
//         setProducts(docSnap.data().products);
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       toast.error("Error loading products");
//       setLoading(false);
//     }
//   };

//   const handleEdit = (product: Product) => {
//     setOriginalName(product.name);
//     setEditingProduct({ ...product, imageUrls: product.imageUrls || [product.imageUrl || ""] });
//   };

//   const handleDelete = async (productName: string) => {
//     try {
//       const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
//       const updatedProducts = products.filter((p) => p.name !== productName);
//       await updateDoc(docRef, { products: updatedProducts });
//       setProducts(updatedProducts);
//       toast.success("Product deleted successfully");
//     } catch (error) {
//       console.error("Error deleting product:", error);
//       toast.error("Error deleting product");
//     }
//   };

//   const handleUpdate = async () => {
//     if (!editingProduct) return;
//     try {
//       const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
//       const updatedProducts = products.map((p) =>
//         p.name === originalName ? { ...editingProduct, imageUrl: editingProduct.imageUrls[0] } : p
//       );
//       await updateDoc(docRef, { products: updatedProducts });
//       setProducts(updatedProducts);
//       setEditingProduct(null);
//       toast.success("Product updated successfully");
//     } catch (error) {
//       console.error("Error updating product:", error);
//       toast.error("Error updating product");
//     }
//   };

//   const addImageUrl = () => {
//     if (editingProduct) {
//       setEditingProduct({
//         ...editingProduct,
//         imageUrls: [...editingProduct.imageUrls, ""]
//       });
//     }
//   };

//   const handleImageUrlChange = (index: number, value: string) => {
//     if (editingProduct) {
//       const newImageUrls = [...editingProduct.imageUrls];
//       newImageUrls[index] = value;
//       setEditingProduct({ ...editingProduct, imageUrls: newImageUrls });
//     }
//   };

//   return (
//     <div className="container mx-auto p-8 space-y-8 bg-gradient-to-r from-gray-100 to-gray-300 rounded-lg shadow-lg">
//       <div className="flex items-center justify-between">
//         <h1 className="text-4xl font-bold text-gray-800">Product Management</h1>
//         <Button variant="outline" onClick={() => navigate("/admin")} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white">
//           <ArrowLeft className="h-5 w-5" /> Back to Admin
//         </Button>
//       </div>

//       <div className="grid gap-6">
//         {products.map((product) => (
//           <div key={product.name} className="p-6 bg-white rounded-lg shadow-lg flex items-center gap-6 transition-transform transform hover:scale-105">
//             <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
//               <img src={product.imageUrls?.[0] || product.imageUrl || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
//             </div>
//             <div className="flex-grow">
//               <h3 className="text-2xl font-semibold text-gray-700">{product.name}</h3>
//               <p className="text-md text-gray-500">{product.category} - {product.weight}g</p>
//             </div>
//             <div className="flex gap-3">
//               <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="bg-blue-500 hover:bg-blue-600 text-white">
//                 <Edit className="h-5 w-5" /> Edit
//               </Button>
//               <Button variant="destructive" size="sm" onClick={() => handleDelete(product.name)} className="bg-red-500 hover:bg-red-600 text-white">
//                 <Trash2 className="h-5 w-5" /> Delete
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {editingProduct && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
//             <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
//             <Label>Product Category</Label>
//             <Input value={editingProduct.productCategory} onChange={(e) => setEditingProduct({ ...editingProduct, productCategory: e.target.value })} />
//             <Label>Name</Label>
//             <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
//             <Label>Weight (g)</Label>
//             <Input type="number" value={editingProduct.weight} onChange={(e) => setEditingProduct({ ...editingProduct, weight: parseFloat(e.target.value) })} />
//             <Label>Product Images</Label>
//             {editingProduct.imageUrls.map((url, index) => (
//               <Input key={index} type="url" value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} />
//             ))}
//             <Button type="button" onClick={addImageUrl} className="mt-2">Add Image</Button>
//             <div className="flex justify-end gap-2 mt-4">
//               <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
//               <Button onClick={handleUpdate}>Save Changes</Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductManagement;

//------------------------------------------------//
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

const MATERIALS = {
  Gold: ["24 Karat", "22 Karat", "20 Karat", "18 Karat"],
  Silver: ["Fine Silver-99.9%", "Sterling Silver-92.5%"],
  
};

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
              <Select value={editingProduct.material} onValueChange={(value) => setEditingProduct({ ...editingProduct, material: value, purity: "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(MATERIALS).map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <Label>Purity</Label>
              <Select value={editingProduct.purity} onValueChange={(value) => setEditingProduct({ ...editingProduct, purity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purity" />
                </SelectTrigger>
                <SelectContent>
                  {editingProduct.material &&
                    MATERIALS[editingProduct.material as keyof typeof MATERIALS].map((purity) => (
                      <SelectItem key={purity} value={purity}>
                        {purity}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

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

