// import { useState } from "react";
// import { doc, updateDoc, arrayUnion } from "firebase/firestore";
// import { db, auth } from "@/lib/firebase";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Plus, Trash2 } from "lucide-react";

// const ProductForm = () => {
//   const [formData, setFormData] = useState({
//     category: "",
//     name: "",
//     weight: "",
//     imageUrls: [""], // Changed from single imageUrl to array of imageUrls
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const user = auth.currentUser;

//     if (!user) {
//       toast.error("You must be logged in to add products");
//       return;
//     }

//     // Filter out empty image URLs
//     const validImageUrls = formData.imageUrls.filter(url => url.trim() !== "");

//     if (validImageUrls.length === 0) {
//       toast.error("At least one valid image URL is required");
//       return;
//     }

//     try {
//       const productData = {
//         ...formData,
//         imageUrls: validImageUrls,
//         imageUrl: validImageUrls[0], // Keep the first image as primary for backward compatibility
//         weight: parseFloat(formData.weight),
//         userId: user.uid,
//         timestamp: new Date()
//       };

//       const docRef = doc(db, "productData", "Ng4pODDHfqytrF2iqMtR");
//       await updateDoc(docRef, {
//         products: arrayUnion(productData)
//       });

//       toast.success("Product added successfully!");
//       setFormData({ category: "", name: "", weight: "", imageUrls: [""] });
//     } catch (error) {
//       console.error("Error adding product:", error);
//       toast.error("Error adding product");
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     if (id.startsWith('imageUrl')) {
//       const index = parseInt(id.replace('imageUrl', ''));
//       const newImageUrls = [...formData.imageUrls];
//       newImageUrls[index] = value;
//       setFormData({
//         ...formData,
//         imageUrls: newImageUrls,
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [id]: value,
//       });
//     }
//   };

//   const handleSelectChange = (value: string) => {
//     setFormData({
//       ...formData,
//       category: value,
//     });
//   };

//   const addImageUrl = () => {
//     setFormData({
//       ...formData,
//       imageUrls: [...formData.imageUrls, ""],
//     });
//   };

//   const removeImageUrl = (index: number) => {
//     if (formData.imageUrls.length > 1) {
//       const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
//       setFormData({
//         ...formData,
//         imageUrls: newImageUrls,
//       });
//     }
//   };

//   return (
//     <div className="bg-card rounded-lg p-6 shadow-md">
//       <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="category">Product Category</Label>
//           <Select value={formData.category} onValueChange={handleSelectChange}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select category" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="24 Karat">24 Karat</SelectItem>
//               <SelectItem value="22 Karat">22 Karat</SelectItem>
//               <SelectItem value="20 Karat">20 Karat</SelectItem>
//               <SelectItem value="18 Karat">18 Karat</SelectItem>
//               <SelectItem value="Silver 1">Silver 1</SelectItem>
//               <SelectItem value="Silver 2">Silver 2</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="name">Product Name</Label>
//           <Input
//             type="text"
//             id="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="weight">Product Weight</Label>
//           <Input
//             type="number"
//             id="weight"
//             step="0.001"
//             value={formData.weight}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <Label>Product Images</Label>
//           {formData.imageUrls.map((url, index) => (
//             <div key={index} className="flex gap-2 items-center">
//               <Input
//                 type="url"
//                 id={`imageUrl${index}`}
//                 value={url}
//                 onChange={handleChange}
//                 placeholder="Enter image URL"
//                 required={index === 0}
//               />
//               {index > 0 && (
//                 <Button
//                   type="button"
//                   variant="destructive"
//                   size="icon"
//                   onClick={() => removeImageUrl(index)}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               )}
//             </div>
//           ))}
//           <Button
//             type="button"
//             variant="outline"
//             className="w-full"
//             onClick={addImageUrl}
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             Add Another Image
//           </Button>
//         </div>

//         <Button type="submit" className="w-full">Add Product</Button>
//       </form>
//     </div>
//   );
// };

// export default ProductForm;


import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    weight: "",
    imageUrls: [""],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      toast.error("You must be logged in to add products");
      return;
    }

    // Filter out empty image URLs
    const validImageUrls = formData.imageUrls.filter(url => url.trim() !== "");

    if (validImageUrls.length === 0) {
      toast.error("At least one valid image URL is required");
      return;
    }

    try {
      const productData = {
        ...formData,
        imageUrls: validImageUrls,
        imageUrl: validImageUrls[0], // Keep the first image as primary for backward compatibility
        weight: parseFloat(formData.weight),
        userId: user.uid,
        timestamp: new Date()
      };

      const docRef = doc(db, "productData", "Ng4pODDHfqytrF2iqMtR");
      await updateDoc(docRef, {
        products: arrayUnion(productData)
      });

      toast.success("Product added successfully!");
      setFormData({ category: "", name: "", weight: "", imageUrls: [""] });
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id.startsWith('imageUrl')) {
      const index = parseInt(id.replace('imageUrl', ''));
      const newImageUrls = [...formData.imageUrls];
      newImageUrls[index] = value;
      setFormData({
        ...formData,
        imageUrls: newImageUrls,
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
    });
  };

  const addImageUrl = () => {
    setFormData({
      ...formData,
      imageUrls: [...formData.imageUrls, ""],
    });
  };

  const removeImageUrl = (index: number) => {
    if (formData.imageUrls.length > 1) {
      const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        imageUrls: newImageUrls,
      });
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Product Category</Label>
          <Select value={formData.category} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24 Karat">24 Karat</SelectItem>
              <SelectItem value="22 Karat">22 Karat</SelectItem>
              <SelectItem value="20 Karat">20 Karat</SelectItem>
              <SelectItem value="18 Karat">18 Karat</SelectItem>
              <SelectItem value="Silver 1">Silver 1</SelectItem>
              <SelectItem value="Silver 2">Silver 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Product Weight</Label>
          <Input
            type="number"
            id="weight"
            step="0.001"
            value={formData.weight}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Product Images</Label>
          {formData.imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                type="url"
                id={`imageUrl${index}`}
                value={url}
                onChange={handleChange}
                placeholder="Enter image URL"
                required={index === 0}
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeImageUrl(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addImageUrl}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Image
          </Button>
        </div>

        <div className="space-y-2">
          <Button type="submit" className="w-full">Add Product</Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/admin/products")}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Products
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;