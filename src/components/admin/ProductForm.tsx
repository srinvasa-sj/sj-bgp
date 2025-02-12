



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

// Helper function to generate a 6-digit alphanumeric product ID (2 letters + 4 numbers)
const generateProductID = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let productID = '';
  
  // Generate 2 random letters
  for (let i = 0; i < 2; i++) {
    productID += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Generate 4 random numbers
  for (let i = 0; i < 4; i++) {
    productID += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return productID;
};

const PRODUCT_CATEGORIES = [
  'Earrings', 'Necklaces', 'Rings', 'Bracelets', 
  'Bangles', 'Anklets', "Men's Jewellery", "Kid's Jewellery"
];

const MATERIALS = {
  'Gold': ['24 Karat', '22 Karat', '20 Karat', '18 Karat'],
  'Silver': ['Fine Silver-99.9%', 'Sterling Silver-92.5%']
};

const ProductForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productID: "",
    productCategory: "",
    material: "",
    purity: "",
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

    const validImageUrls = formData.imageUrls.filter(url => url.trim() !== "");

    if (validImageUrls.length === 0) {
      toast.error("At least one valid image URL is required");
      return;
    }

    try {
      const productID = generateProductID();
      
      const productData = {
        ...formData,
        imageUrls: validImageUrls,
        imageUrl: validImageUrls[0],
        weight: parseFloat(formData.weight),
        userId: user.uid,
        timestamp: new Date(),
        productID,
        productCategory: formData.productCategory, // Changed to match formData
      };

      const docRef = doc(db, "productData", "UelsUgCcOKCYUVPV2dRC");
      await updateDoc(docRef, {
        products: arrayUnion(productData)
      });

      toast.success("Product added successfully!");
      setFormData({
        productID: "",
        productCategory: "",
        material: "",
        purity: "",
        name: "",
        weight: "",
        imageUrls: [""]
      });
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

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset purity when material changes
      if (field === 'material') {
        newData.purity = '';
      }
      
      return newData;
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
          <Label htmlFor="productCategory">Product Category</Label>
          <Select 
            value={formData.productCategory} 
            onValueChange={(value) => handleSelectChange('productCategory', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Select 
            value={formData.material} 
            onValueChange={(value) => handleSelectChange('material', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(MATERIALS).map((material) => (
                <SelectItem key={material} value={material}>{material}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.material && (
          <div className="space-y-2">
            <Label htmlFor="purity">Purity</Label>
            <Select 
              value={formData.purity} 
              onValueChange={(value) => handleSelectChange('purity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purity" />
              </SelectTrigger>
              <SelectContent>
                {MATERIALS[formData.material as keyof typeof MATERIALS].map((purity) => (
                  <SelectItem key={purity} value={purity}>{purity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
          <Label htmlFor="weight">Product Weight (g)</Label>
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

