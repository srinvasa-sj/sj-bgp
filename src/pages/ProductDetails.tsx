import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ImageGallery from "@/components/products/details/ImageGallery";
import PriceBreakdown from "@/components/products/details/PriceBreakdown";

interface Product {
  name: string;
  purity: string;
  weight: number;
  imageUrl: string;
  imageUrls?: string[];
}

const ProductDetails = () => {
  const { productName } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [promotionPrice, setPromotionPrice] = useState<number | null>(null);
  const [activePromotion, setActivePromotion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        console.log("Fetching product details for:", productName);
        setIsLoading(true);
        
        const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productsData = docSnap.data().products;
          const productData = productsData.find((p: Product) => p.name === productName);

          if (productData) {
            console.log("Found product data:", productData);
            const allImages = Array.from(new Set([productData.imageUrl, ...(productData.imageUrls || [])])).filter(Boolean);
            const product = {
              ...productData,
              imageUrls: allImages,
            };
            
            // Reset states before fetching new data
            setProduct(product);
            setActivePromotion(null);
            setPromotionPrice(null);
            setPriceBreakdown(null);
            setOriginalPrice(null);
            
            // First fetch promotion details and wait for it
            const promotion = await fetchPromotionDetails(product);
            
            // Then calculate prices with the promotion
            await calculatePrices(product, promotion);
          } else {
            toast.error("Product not found");
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Error loading product details");
      } finally {
        setIsLoading(false);
      }
    };

    if (productName) {
      fetchProductDetails();
    }
  }, [productName]);

  const fetchPromotionDetails = async (product: Product) => {
    try {
      console.log("Fetching promotions for product:", product.name);
      const promotionsRef = collection(db, "promotions");
      const q = query(promotionsRef, where("productName", "==", product.name));

      const querySnapshot = await getDocs(q);
      const currentDate = new Date();
      let foundPromotion = null;

      for (const doc of querySnapshot.docs) {
        const promoData = doc.data();
        
        // Parse dates and normalize to UTC midnight
        const startDate = new Date(promoData.startDate);
        const endDate = new Date(promoData.endDate);
        
        // Set current date to UTC midnight for consistent comparison
        const currentUTC = new Date(Date.UTC(
          currentDate.getUTCFullYear(),
          currentDate.getUTCMonth(),
          currentDate.getUTCDate()
        ));

        // Set start date to UTC midnight
        const startUTC = new Date(Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate()
        ));

        // Set end date to UTC 23:59:59.999
        const endUTC = new Date(Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate(),
          23, 59, 59, 999
        ));

        // Ensure all discount values are numbers
        const priceDiscount = Number(promoData.priceDiscount) || 0;
        const wastageDiscount = Number(promoData.wastageDiscount) || 0;
        const makingChargesDiscount = Number(promoData.makingChargesDiscount) || 0;

        // Check if the promotion is active based on dates
        const isWithinDateRange = currentUTC >= startUTC && currentUTC <= endUTC;

        console.log("Checking promotion:", {
          name: promoData.promotionName,
          startDate: startUTC.toISOString(),
          endDate: endUTC.toISOString(),
          currentDate: currentUTC.toISOString(),
          isWithinDateRange,
          discounts: { priceDiscount, wastageDiscount, makingChargesDiscount }
        });

        // Only consider promotion if it has at least one non-zero discount
        const hasValidDiscounts = priceDiscount > 0 || wastageDiscount > 0 || makingChargesDiscount > 0;

        if (isWithinDateRange && hasValidDiscounts) {
          console.log("Found valid promotion with discounts:", {
            name: promoData.promotionName,
            priceDiscount,
            wastageDiscount,
            makingChargesDiscount,
            startDate: startUTC.toISOString(),
            endDate: endUTC.toISOString()
          });
          
          foundPromotion = {
            ...promoData,
            id: doc.id,
            startDate: startUTC.toISOString(),
            endDate: endUTC.toISOString(),
            priceDiscount,
            wastageDiscount,
            makingChargesDiscount
          };
          break;
        }
      }

      console.log("Setting active promotion:", foundPromotion);
      setActivePromotion(foundPromotion);
      return foundPromotion;
    } catch (error) {
      console.error("Error fetching promotion:", error);
      return null;
    }
  };

  const calculatePrices = async (product: Product, promotion: any) => {
    try {
      console.log("Calculating prices for product:", {
        name: product.name,
        purity: product.purity,
        weight: product.weight,
        hasPromotion: !!promotion,
        promotionDetails: promotion
      });

      const priceDocRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
      const priceDocSnap = await getDoc(priceDocRef);

      if (!priceDocSnap.exists()) {
        console.error("Price data not available");
        toast.error("Error: Price data not available");
        return;
      }

      const priceData = priceDocSnap.data();
      let basePrice = 0;
      let wastagePercentage = 0;
      let makingChargesPerGram = 0;
      let applyWastageMakingCharges = true;

      // Get the correct price and charges based on purity
      switch (product.purity) {
        case "18 Karat":
          basePrice = Number(priceData.price18Karat);
          wastagePercentage = Number(priceData.goldwastageCharges);
          makingChargesPerGram = Number(priceData.goldmakingCharges);
          break;
        case "20 Karat":
          basePrice = Number(priceData.price20Karat);
          wastagePercentage = Number(priceData.goldwastageCharges);
          makingChargesPerGram = Number(priceData.goldmakingCharges);
          break;
        case "22 Karat":
          basePrice = Number(priceData.price22Karat);
          wastagePercentage = Number(priceData.goldwastageCharges);
          makingChargesPerGram = Number(priceData.goldmakingCharges);
          break;
        case "24 Karat":
          basePrice = Number(priceData.price24Karat);
          applyWastageMakingCharges = false;
          break;
        case "Silver 999":
          basePrice = Number(priceData.priceSilver1);
          wastagePercentage = Number(priceData.wastageChargesSilver);
          makingChargesPerGram = Number(priceData.makingChargesSilver);
          break;
        case "Silver 925":
          basePrice = Number(priceData.priceSilver2);
          wastagePercentage = Number(priceData.wastageChargesSilver);
          makingChargesPerGram = Number(priceData.makingChargesSilver);
          break;
        default:
          console.error("Invalid product purity:", product.purity);
          toast.error("Error: Invalid product purity");
          return;
      }

      // Ensure all values are numbers
      const weight = Number(product.weight);
      basePrice = Number(basePrice);
      wastagePercentage = Number(wastagePercentage);
      makingChargesPerGram = Number(makingChargesPerGram);

      console.log("Base calculation values:", {
        basePrice,
        weight,
        wastagePercentage,
        makingChargesPerGram,
        applyWastageMakingCharges
      });

      // Calculate original price components
      const baseAmount = basePrice * weight;
      let wastageCharges = 0;
      let makingCharges = 0;

      if (applyWastageMakingCharges) {
        wastageCharges = baseAmount * (wastagePercentage / 100);
        makingCharges = makingChargesPerGram * weight;
      }

      const totalPrice = baseAmount + wastageCharges + makingCharges;

      console.log("Original price components:", {
        baseAmount,
        wastageCharges,
        makingCharges,
        totalPrice
      });

      // Set original price and breakdown
      setOriginalPrice(totalPrice);
      setPriceBreakdown({
        baseAmount,
        wastageCharges,
        makingCharges,
        wastagePercentage,
        makingChargesPerGram,
      });

      // Calculate promotional price if there's an active promotion
      if (promotion) {
        // Ensure discount values are numbers and convert to decimals
        const priceDiscount = Number(promotion.priceDiscount) || 0;
        const wastageDiscount = Number(promotion.wastageDiscount) || 0;
        const makingChargesDiscount = Number(promotion.makingChargesDiscount) || 0;

        console.log("Applying promotional discounts:", {
          priceDiscount,
          wastageDiscount,
          makingChargesDiscount
        });

        // Calculate discounted components
        const discountedBaseAmount = baseAmount * (1 - (priceDiscount / 100));
        const discountedWastageCharges = applyWastageMakingCharges ? 
          wastageCharges * (1 - (wastageDiscount / 100)) : 0;
        const discountedMakingCharges = applyWastageMakingCharges ? 
          makingCharges * (1 - (makingChargesDiscount / 100)) : 0;

        // Calculate total promotional price by summing discounted components
        const promotionalPrice = discountedBaseAmount + discountedWastageCharges + discountedMakingCharges;

        console.log("Promotional price calculation:", {
          discountedBaseAmount,
          discountedWastageCharges,
          discountedMakingCharges,
          promotionalPrice,
          totalDiscount: ((totalPrice - promotionalPrice) / totalPrice * 100).toFixed(2) + '%'
        });

        setPromotionPrice(promotionalPrice);
      } else {
        console.log("No active promotion, skipping promotional price calculation");
        setPromotionPrice(null);
      }
    } catch (error) {
      console.error("Error calculating prices:", error);
      toast.error("Error calculating product prices");
    }
  };

  if (isLoading || !product || !priceBreakdown) {
    return (
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImageGallery mainImage={product.imageUrl} images={product.imageUrls} />

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Name: {product.name}</h1>
          <h2 className="text-xl text-gray-500">Purity: {product.purity}</h2>
          <p className="text-lg">Weight: {product.weight} grams</p>

          <PriceBreakdown
            originalPrice={originalPrice}
            promotionPrice={promotionPrice}
            priceBreakdown={priceBreakdown}
            activePromotion={activePromotion}
            product={product}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
