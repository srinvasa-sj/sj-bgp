import { useState, useEffect, useCallback, useMemo } from "react";
import { doc, updateDoc, arrayUnion, collection, getDocs, query, orderBy, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Category } from "@/types/category";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import debounce from 'lodash/debounce';

// Update constants
const MATERIALS = ['Gold', 'Silver'] as const;

const DESIGNS = [
  'Antique',
  'Kundan',
  'Meenakari',
  'Jadau',
  'Temple',
  'Modern',
  'Gemstone',
  'Traditional',
  'Fancy'
] as const;

const PURITY_OPTIONS = {
  'Gold': ['18 Karat', '20 Karat', '22 Karat', '24 Karat'],
  'Silver': ['Silver 999', 'Silver 925']
} as const;

const generateProductID = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  return Array(2).fill(0).map(() => letters[Math.floor(Math.random() * letters.length)]).join('') +
         Array(4).fill(0).map(() => numbers[Math.floor(Math.random() * numbers.length)]).join('');
};

// Update schema to include the new required fields
const productSchema = z.object({
  mainCategory: z.string().min(1, "Main category is required"),
  subCategory: z.string().optional(),
  material: z.enum(['Gold', 'Silver'], { required_error: "Material is required" }),
  design: z.enum(['Antique', 'Kundan', 'Meenakari', 'Jadau', 'Temple', 'Modern', 'Gemstone', 'Traditional', 'Fancy'], { required_error: "Design is required" }),
  purity: z.string().min(1, "Purity is required"),
  name: z.string().min(1, "Product name is required"),
  imageUrls: z.array(z.string()).min(1, "At least one image is required").max(5, "Maximum 5 images allowed"),
  attributes: z.record(z.string(), z.string()).default({})
});

type ProductFormData = z.infer<typeof productSchema>;
type ProductFormFields = keyof ProductFormData | `attributes.${string}` | `imageUrls.${number}`;

const ProductForm = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize category computations
  const { mainCategories, subCategories } = useMemo(() => ({
    mainCategories: categories.filter(cat => !cat.parentId),
    subCategories: categories.filter(cat => cat.parentId)
  }), [categories]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      mainCategory: "",
      subCategory: "",
      material: "Gold",
      design: "Antique",
      purity: "",
      name: "",
      imageUrls: [""],
      attributes: {}
    },
    mode: "onBlur"
  });

  const getSubcategoriesForParent = useCallback((parentId: string) => {
    return subCategories.filter(cat => cat.parentId === parentId);
  }, [subCategories]);

  // Get selected category's attributes
  const selectedCategory = useMemo(() => {
    const { mainCategory, subCategory } = form.watch();
    return categories.find(cat => cat.id === subCategory) || 
           categories.find(cat => cat.id === mainCategory);
  }, [categories, form.watch(['mainCategory', 'subCategory'])]);

  // Update form attributes when selected category changes
  useEffect(() => {
    if (selectedCategory?.attributes) {
      form.setValue('attributes', Object.fromEntries(
        selectedCategory.attributes.map(attr => [attr.id, ""])
      ));
    }
  }, [selectedCategory, form]);

  // Add form error handling
  const formErrors = form.formState.errors;
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      const firstError = Object.values(formErrors)[0];
      if (firstError?.message) {
        toast.error(String(firstError.message));
      }
    }
  }, [formErrors]);

  // Add debug logging for form state
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('Form field updated:', { name, type, value });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Fetch categories once on mount
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const q = query(categoriesRef, orderBy('sortOrder'));
        const querySnapshot = await getDocs(q);
        
        if (!mounted) return;

        const fetchedCategories: Category[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() } as Category);
        });
        
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (mounted) {
          toast.error('Failed to load categories');
        }
      } finally {
        if (mounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    console.log("Form submission started", { data });

    if (!auth.currentUser) {
      toast.error("You must be logged in to add products");
      return;
    }

    setIsSubmitting(true);
    try {
      const productID = generateProductID();
      console.log("Generated product ID:", productID);
      
      const validImageUrls = data.imageUrls.filter(url => url.trim() !== "");
      console.log("Valid image URLs:", validImageUrls);
      
      const selectedCat = categories.find(cat => 
        cat.id === (data.subCategory || data.mainCategory)
      );

      if (!selectedCat) {
        throw new Error("Selected category not found");
      }
      console.log("Selected category:", selectedCat);

      // Find weight attribute and get its value
      const weightAttr = selectedCat.attributes.find(attr => attr.type === 'weight');
      const weight = weightAttr ? parseFloat(data.attributes[weightAttr.id] || "0") : 0;
      console.log("Weight value:", weight);
      
      const productData = {
        productID,
        productCategory: selectedCat.name,
        name: data.name.trim(),
        material: data.material,
        design: data.design,
        purity: data.purity,
        weight,
        imageUrls: validImageUrls,
        imageUrl: validImageUrls[0],
        userId: auth.currentUser.uid,
        timestamp: new Date().toISOString(),
        categoryId: data.subCategory || data.mainCategory,
        attributes: data.attributes
      };

      console.log("Saving product data:", productData);

      // Get a reference to the products document
      const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
      
      try {
        // First try to get the document
        const docSnap = await getDoc(docRef);
        console.log("Document exists:", docSnap.exists());
        
        if (docSnap.exists()) {
          // Document exists, update it
      await updateDoc(docRef, {
        products: arrayUnion(productData)
      });
          console.log("Product added to existing document");
        } else {
          // Document doesn't exist, create it
          await setDoc(docRef, {
            products: [productData]
          });
          console.log("Created new document with product");
        }

      toast.success("Product added successfully!");
        
        // Reset form
        form.reset({
          mainCategory: "",
          subCategory: "",
          material: "Gold",
          design: "Antique",
        purity: "",
        name: "",
          imageUrls: [""],
          attributes: Object.fromEntries(
            selectedCat.attributes.map(attr => [attr.id, ""])
          )
        });
      } catch (firestoreError) {
        console.error("Firestore operation failed:", firestoreError);
        throw new Error("Failed to save product to database");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImage = useCallback(() => {
    const currentUrls = form.getValues("imageUrls");
    if (currentUrls.length < 5) {
      form.setValue("imageUrls", [...currentUrls, ""], { shouldValidate: true });
    }
  }, [form]);

  const handleRemoveImage = useCallback((index: number) => {
    const currentUrls = form.getValues("imageUrls");
    if (currentUrls.length > 1) {
      form.setValue(
        "imageUrls",
        currentUrls.filter((_, i) => i !== index),
        { shouldValidate: true }
      );
    }
  }, [form]);

  // Optimize Controller render for input fields
  const renderInput = useCallback(
    ({ field }: { field: { name: keyof ProductFormData | `attributes.${string}` | `imageUrls.${number}`; onChange: (e: any) => void; value: any } }) => (
      <Input
        {...field}
        onChange={(e) => {
          field.onChange(e);
          form.setValue(field.name, e.target.value);
        }}
      />
    ),
    [form]
  );

  // Memoize form field components
  const renderFormField = useCallback(
    (name: keyof ProductFormData, label: string) => (
      <div>
        <Label htmlFor={name}>{label}</Label>
        <Controller
          name={name}
          control={form.control}
          render={renderInput}
        />
      </div>
    ),
    [form.control, renderInput]
  );

  // Memoize attribute field rendering
  const renderAttributeField = useCallback(
    (attr: any) => (
      <div key={attr.id} className="space-y-2">
        <Label htmlFor={attr.id}>{attr.name}</Label>
        <Controller
          name={`attributes.${attr.id}`}
          control={form.control}
          render={({ field }) => (
            attr.type === 'select' ? (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${attr.name.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {attr.options?.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                {...field}
                type={attr.type === 'weight' ? 'number' : attr.type === 'number' ? 'number' : 'text'}
                step={attr.type === 'weight' ? '0.001' : attr.type === 'number' ? '1' : undefined}
                min={attr.type === 'weight' ? '0' : attr.type === 'number' ? attr.validation?.min : undefined}
                max={attr.type === 'weight' ? '9999.999' : attr.type === 'number' ? attr.validation?.max : undefined}
                placeholder={`Enter ${attr.name.toLowerCase()}`}
                required={attr.required}
                onChange={(e) => {
                  field.onChange(e);
                  form.setValue(`attributes.${attr.id}`, e.target.value);
                }}
              />
            )
          )}
        />
      </div>
    ),
    [form]
  );

  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Category */}
          <div className="space-y-2">
            <Label htmlFor="mainCategory">Main Category</Label>
            {isLoadingCategories ? (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading categories...</span>
              </div>
            ) : (
              <Controller
                name="mainCategory"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("subCategory", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </div>

          {/* Sub Category */}
          {form.watch("mainCategory") && (
        <div className="space-y-2">
              <Label htmlFor="subCategory">
                Sub Category (Optional)
                <span className="text-sm text-gray-500 ml-2">Leave empty to use main category</span>
              </Label>
              <Controller
                name="subCategory"
                control={form.control}
                render={({ field }) => (
          <Select 
                    value={field.value}
                    onValueChange={field.onChange}
          >
            <SelectTrigger>
                      <SelectValue placeholder="Select sub category (optional)" />
            </SelectTrigger>
            <SelectContent>
                      {getSubcategoriesForParent(form.watch("mainCategory")).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
              ))}
            </SelectContent>
          </Select>
                )}
              />
            </div>
          )}
        </div>

        {/* Material and Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Material */}
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
            <Controller
              name="material"
              control={form.control}
              render={({ field }) => (
          <Select 
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("purity", ""); // Reset purity when material changes
                  }}
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
              )}
            />
          </div>

          {/* Design */}
          <div className="space-y-2">
            <Label htmlFor="design">Design</Label>
            <Controller
              name="design"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select design" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNS.map((design) => (
                      <SelectItem key={design} value={design}>{design}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Purity */}
        {form.watch("material") && (
          <div className="space-y-2">
            <Label htmlFor="purity">Purity</Label>
            <Controller
              name="purity"
              control={form.control}
              render={({ field }) => (
            <Select 
                  value={field.value}
                  onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purity" />
              </SelectTrigger>
              <SelectContent>
                    {PURITY_OPTIONS[form.watch("material")]?.map((purity) => (
                  <SelectItem key={purity} value={purity}>{purity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
              )}
            />
          </div>
        )}

        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Controller
            name="name"
            control={form.control}
            render={renderInput}
          />
        </div>

        {/* Additional Category Attributes */}
        {selectedCategory?.attributes && selectedCategory.attributes.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-sm text-gray-700">Additional Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCategory.attributes
                .filter(attr => !['material', 'design', 'purity'].includes(attr.id))
                .map((attr) => renderAttributeField(attr))}
            </div>
          </div>
        )}

        {/* Images */}
        <div className="space-y-2">
          <Label>Product Images (1-5)</Label>
          {form.watch("imageUrls").map((_, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Controller
                name={`imageUrls.${index}`}
                control={form.control}
                render={({ field }) => (
              <Input
                    {...field}
                type="url"
                placeholder="Enter image URL"
                  />
                )}
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {form.watch("imageUrls").length < 5 && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
              onClick={handleAddImage}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Image
          </Button>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="space-y-2">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Product...
              </>
            ) : (
              'Add Product'
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/admin/products")}
            disabled={isSubmitting}
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

