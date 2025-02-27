import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Wand2, Share } from "lucide-react";
import { whatsappService } from "@/services/whatsappService";
import { templateGeneratorService } from "@/services/templateGeneratorService";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Website configuration
const WEBSITE_CONFIG = {
  baseUrl: 'https://srinivasajewellers-bgp.web.app',
  contactNumber: '+91 1234567890',
  storeAddress: 'SJ Jewellers, Main Street, City',
  whatsappNumber: '+91 1234567890'
};

interface Product {
  id: string;
  name: string;
  price?: number;
  description?: string;
  category?: string;
  productCategory?: string;
  material?: string;
  weight?: number;
  imageUrl?: string;
  imageUrls?: string[];
  productID?: string;
  purity?: string;
  design?: string;
  attributes?: Record<string, any>;
  originalPrice?: number;
  discountedPrice?: number;
  priceDisplay?: string;
  activePromotion?: {
    promotionName: string;
    priceDiscount: number;
    wastageDiscount: number;
    makingChargesDiscount: number;
    endDate: string;
  };
}

interface Promotion {
  id: string;
  promotionName: string;
  priceDiscount: number;
  wastageDiscount: number;
  makingChargesDiscount: number;
  giftDescription?: string;
  startDate: string;
  endDate: string;
  productName: string;
  popularProducts?: Product[];
}

interface GeneratedContent {
  message: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export const AITemplateGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [metalRatesLoading, setMetalRatesLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedType, setSelectedType] = useState<'product' | 'promotion' | 'category'>('product');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    message: '',
    imageUrl: '',
    imageUrls: []
  });
  const [metalRates, setMetalRates] = useState<{
    price18Karat: number;
    price20Karat: number;
    price22Karat: number;
    price24Karat: number;
    priceSilver1: number;
    priceSilver2: number;
    goldmakingCharges: number;
    goldwastageCharges: number;
    makingChargesSilver: number;
    wastageChargesSilver: number;
  }>({
    price18Karat: 0,
    price20Karat: 0,
    price22Karat: 0,
    price24Karat: 0,
    priceSilver1: 0,
    priceSilver2: 0,
    goldmakingCharges: 0,
    goldwastageCharges: 0,
    makingChargesSilver: 0,
    wastageChargesSilver: 0
  });

  // Helper function to get the best available image URL
  const getBestImageUrl = (product: any): string => {
    if (product.imageUrl) return product.imageUrl;
    if (product.imageUrls && product.imageUrls.length > 0) return product.imageUrls[0];
    return '';
  };

  // Helper function to get price from product
  const getProductPrice = (product: any): number => {
    return 0; // Return 0 to indicate price should be requested
  };

  // Helper function to calculate promotional price
  const calculatePromotionalPrice = (product: Product, promotion?: any): { originalPrice: number; discountedPrice: number } => {
    return { originalPrice: 0, discountedPrice: 0 }; // Return 0 to indicate price should be requested
  };

  // Helper function to map product data
  const mapProductData = (product: any, activePromotion: any) => {
    const mappedProduct = {
      id: product.productID || product.id,
      name: product.name,
      price: 0,
      description: product.description || '',
      category: product.productCategory || product.category || '',
      material: product.material || '',
      weight: product.weight || 0,
      imageUrl: getBestImageUrl(product),
      purity: product.purity || '',
      design: product.design || '',
      attributes: product.attributes || {},
      activePromotion: null, // Disable promotions since we're not showing prices
      originalPrice: 0,
      discountedPrice: 0,
      priceDisplay: 'Price available on request'
    };

    return mappedProduct;
  };

  // Fetch metal rates separately
  useEffect(() => {
    const fetchMetalRates = async () => {
      try {
        const metalRatesDoc = await getDoc(doc(db, "metalRates", "current"));
        if (!metalRatesDoc.exists()) {
          console.error('Metal rates document does not exist');
          return;
        }

        const rates = metalRatesDoc.data();
        console.log('Fetched metal rates:', rates);
        
        // Validate metal rates
        if (!rates.price18Karat || !rates.price20Karat || !rates.price22Karat || !rates.price24Karat) {
          console.error('Invalid metal rates:', rates);
          return;
        }
        
        setMetalRates(rates as any);
      } catch (error) {
        console.error('Error fetching metal rates:', error);
      } finally {
        setMetalRatesLoading(false);
      }
    };

    fetchMetalRates();
  }, []);

  // Fetch products and promotions after metal rates are loaded
  useEffect(() => {
    if (metalRatesLoading) return;

    const fetchData = async () => {
      try {
        // Fetch active promotions
        const promotionsSnapshot = await getDocs(query(collection(db, 'promotions'),
          where('endDate', '>=', new Date().toISOString())));
        const activePromotions = promotionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Promotion[];
        setPromotions(activePromotions);

        // Fetch products
        const productDataDoc = await getDoc(doc(db, "productData", "zzeEfRyePYTdWemfHHWH"));
        if (productDataDoc.exists()) {
          const productsArray = productDataDoc.data().products || [];
          const productsData = productsArray
            .filter((product: any) => {
              if (!product.name || (!product.imageUrl && (!product.imageUrls || product.imageUrls.length === 0))) {
                return false;
              }
              return true;
            })
            .map((product: any) => {
              const activePromotion = activePromotions.find(promo => 
                promo.productName === product.name
              );
              return mapProductData(product, activePromotion);
            });

          console.log('Mapped Products:', productsData);
          setProducts(productsData);

          const uniqueCategories = Array.from(new Set(productsData.map(p => p.category?.toString()))).filter((cat): cat is string => Boolean(cat));
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };

    fetchData();
  }, [metalRatesLoading]);

  const handleGenerateTemplate = async () => {
    try {
      setLoading(true);

      if (selectedType === 'category' && selectedCategory) {
        const categoryProducts = products.filter(p => p.category === selectedCategory);
        if (categoryProducts.length === 0) {
          toast.error('No products found in selected category');
          return;
        }

        const template = await templateGeneratorService.generateTemplate('category', {
          category: selectedCategory,
          products: categoryProducts.map(p => ({
            ...p,
            priceDisplay: 'Price available on request'
          }))
        });
        
        setGeneratedContent({
          message: template.message,
          imageUrl: template.imageUrl,
          imageUrls: template.imageUrls
        });
      } else if (selectedType === 'promotion' && selectedItemId) {
        const promotion = promotions.find(p => p.id === selectedItemId);
        if (!promotion) {
          toast.error('Selected promotion not found');
          return;
        }

        const mainProduct = products.find(p => p.name === promotion.productName);
        if (!mainProduct) {
          toast.error('Promotion product not found');
          return;
        }

        const template = await templateGeneratorService.generateTemplate('promotion', {
          product: {
            ...mainProduct,
            priceDisplay: 'Price available on request'
          },
          promotion: promotion
        });

        setGeneratedContent({
          message: template.message,
          imageUrl: template.imageUrl,
          imageUrls: template.imageUrls
        });
      } else if (selectedType === 'product') {
        const selectedProductsData = selectedProducts.length > 0 
          ? selectedProducts.map(id => {
              const product = products.find(p => p.id === id);
              return product ? {
                ...product,
                priceDisplay: 'Price available on request'
              } : null;
            }).filter(Boolean)
          : [products.find(p => p.id === selectedItemId)].filter(Boolean).map(p => ({
              ...p,
              priceDisplay: 'Price available on request'
            }));

        if (selectedProductsData.length === 0) {
          toast.error('No products selected');
          return;
        }

        const template = await templateGeneratorService.generateTemplate(
          selectedProductsData.length > 1 ? 'multiple_products' : 'product',
          selectedProductsData.length > 1 ? { products: selectedProductsData } : selectedProductsData[0]
        );

        setGeneratedContent({
          message: template.message,
          imageUrl: template.imageUrl,
          imageUrls: template.imageUrls
        });
      }

      toast.success('Template generated successfully!');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleShareToWhatsApp = async () => {
    if (!generatedContent.message) {
      toast.error('Please generate a template first');
      return;
    }

    try {
      setLoading(true);
      const hasImages = generatedContent.imageUrls?.length > 0 || !!generatedContent.imageUrl;
      
      if (hasImages) {
        toast.info('Opening WhatsApp windows for images and message. Please allow pop-ups if prompted.');
      }

      const response = await whatsappService.sendTemplate({
        message: generatedContent.message,
        imageUrl: generatedContent.imageUrl,
        imageUrls: generatedContent.imageUrls
      });

      if (hasImages) {
        toast.success('Images and message ready to be shared on WhatsApp!');
      } else {
        toast.success('Template ready to be shared on WhatsApp!');
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      toast.error('Failed to share template to WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Generator</CardTitle>
          <CardDescription>
            Generate engaging WhatsApp templates for your products and promotions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Template Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value: 'product' | 'promotion' | 'category') => {
                setSelectedType(value);
                setSelectedItemId('');
                setSelectedCategory('');
                setSelectedProducts([]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product(s)</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedType === 'category' ? (
            <div className="space-y-2">
              <Label>Select Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : selectedType === 'product' ? (
            <div className="space-y-2">
              <Label>Select Products</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {products.map(product => {
                  const isSelected = selectedProducts.includes(product.id);
                  
                  return (
                    <Button
                      key={product.id}
                      variant={isSelected ? "default" : "outline"}
                      className="text-sm justify-start p-2 h-auto"
                      onClick={() => handleProductSelect(product.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-sm"
                          />
                        )}
                        <div className="flex-1 truncate">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Price available on request
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Select Promotion</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a promotion" />
                </SelectTrigger>
                <SelectContent>
                  {promotions.map(promotion => (
                    <SelectItem key={promotion.id} value={promotion.id}>
                      {promotion.promotionName} - {promotion.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleGenerateTemplate}
            disabled={loading || (!selectedItemId && !selectedCategory && selectedProducts.length === 0)}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Template
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent.message && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Generated Template</span>
              <Button
                onClick={handleShareToWhatsApp}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Share className="h-4 w-4 mr-2" />
                    Share to WhatsApp
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(generatedContent.imageUrls?.length > 0 
                ? generatedContent.imageUrls 
                : (generatedContent.imageUrl ? [generatedContent.imageUrl] : [])
              ).map((imageUrl, index) => (
                <div 
                  key={index} 
                  className="aspect-square w-24 h-24 relative rounded-lg overflow-hidden"
                >
                  <img
                    src={imageUrl}
                    alt={`Product ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
              ))}
            </div>
            <div className="whitespace-pre-wrap rounded-lg border p-4">
              {generatedContent.message}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};