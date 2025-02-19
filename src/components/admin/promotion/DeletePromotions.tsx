import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types/category";
import { MATERIALS, PURITY_OPTIONS } from "@/constants/materials";
import { Trash2 } from "lucide-react";

interface Product {
  name: string;
  productCategory: string;
  material?: string;
  purity?: string;
  weight: number;
  imageUrl: string;
}

interface DeletePromotionsProps {
  products: Product[];
  onDelete: (productNames: string[]) => void;
}

const DeletePromotions = ({ products, onDelete }: DeletePromotionsProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [selectedPurity, setSelectedPurity] = useState<string>("all");
  const [deleteMode, setDeleteMode] = useState<"category" | "material" | "individual">("individual");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<{ productName: string; promotionName: string }[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const q = query(categoriesRef, orderBy("sortOrder"));
        const querySnapshot = await getDocs(q);
        const fetchedCategories = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Category[];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch existing promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const promotionsRef = collection(db, "promotions");
        const q = query(promotionsRef, where("active", "==", true));
        const querySnapshot = await getDocs(q);
        const fetchedPromotions = querySnapshot.docs.map(doc => ({
          productName: doc.data().productName,
          promotionName: doc.data().promotionName
        }));
        setPromotions(fetchedPromotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };
    fetchPromotions();
  }, []);

  // Filter products based on selection criteria
  const filteredProducts = products.filter(product => {
    if (deleteMode === "category" && selectedCategory !== "all") {
      return product.productCategory === selectedCategory;
    }
    if (deleteMode === "material") {
      if (selectedMaterial !== "all" && product.material !== selectedMaterial) {
        return false;
      }
      if (selectedPurity !== "all" && product.purity !== selectedPurity) {
        return false;
      }
      return true;
    }
    return true;
  }).filter(product => 
    promotions.some(promo => promo.productName === product.name)
  );

  // Group categories by parent
  const mainCategories = categories.filter(cat => !cat.parentId);
  const subCategories = categories.filter(cat => cat.parentId);

  const handleSelectAll = () => {
    const allSelected = filteredProducts.every(p => selectedProducts.includes(p.name));
    if (allSelected) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.name));
    }
  };

  const handleProductSelect = (productName: string) => {
    setSelectedProducts(prev => 
      prev.includes(productName)
        ? prev.filter(name => name !== productName)
        : [...prev, productName]
    );
  };

  const handleDelete = () => {
    if (selectedProducts.length === 0) return;
    
    const promotionsToDelete = selectedProducts.flatMap(productName => 
      promotions
        .filter(promo => promo.productName === productName)
        .map(promo => `${productName.toLowerCase().replace(/\s+/g, '-')}-${promo.promotionName.toLowerCase().replace(/\s+/g, '-')}`)
    );
    
    onDelete(promotionsToDelete);
    setSelectedProducts([]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Delete Promotions</h2>
      
      <Tabs defaultValue="individual" onValueChange={(v) => setDeleteMode(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual">Individual Products</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="material">By Material</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredProducts.map((product) => (
              <Button
                key={product.name}
                type="button"
                variant={selectedProducts.includes(product.name) ? "default" : "outline"}
                className="text-sm"
                onClick={() => handleProductSelect(product.name)}
              >
                {product.name}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Main Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {mainCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory !== "all" && (
                <div className="space-y-2">
                  <Label>Sub Category</Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories
                        .filter(cat => {
                          const parent = mainCategories.find(main => main.id === cat.parentId);
                          return parent?.name === selectedCategory;
                        })
                        .map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {filteredProducts.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Products with Active Promotions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {filteredProducts.every(p => selectedProducts.includes(p.name))
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredProducts.map((product) => (
                    <Button
                      key={product.name}
                      type="button"
                      variant={selectedProducts.includes(product.name) ? "default" : "outline"}
                      className="text-sm"
                      onClick={() => handleProductSelect(product.name)}
                    >
                      {product.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="material" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Material</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Materials</SelectItem>
                  {MATERIALS.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMaterial !== "all" && (
              <div className="space-y-2">
                <Label>Purity</Label>
                <Select value={selectedPurity} onValueChange={setSelectedPurity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Purities</SelectItem>
                    {PURITY_OPTIONS[selectedMaterial as keyof typeof PURITY_OPTIONS]?.map((purity) => (
                      <SelectItem key={purity} value={purity}>
                        {purity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {filteredProducts.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Products with Active Promotions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {filteredProducts.every(p => selectedProducts.includes(p.name))
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredProducts.map((product) => (
                  <Button
                    key={product.name}
                    type="button"
                    variant={selectedProducts.includes(product.name) ? "default" : "outline"}
                    className="text-sm"
                    onClick={() => handleProductSelect(product.name)}
                  >
                    {product.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedProducts.length > 0 && (
        <div className="mt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected Promotions ({selectedProducts.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default DeletePromotions; 