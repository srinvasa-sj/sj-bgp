
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
        const docRef = doc(db, "productData", "UelsUgCcOKCYUVPV2dRC");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productsData = docSnap.data().products;
          const productData = productsData.find((p: Product) => p.name === productName);

          if (productData) {
            const allImages = Array.from(new Set([productData.imageUrl, ...(productData.imageUrls || [])])).filter(Boolean);
            setProduct({
              ...productData,
              imageUrls: allImages,
            });

            await fetchPromotionDetails(productData);
            await calculatePrices(productData);
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

    fetchProductDetails();
  }, [productName]);

  const fetchPromotionDetails = async (product: Product) => {
    try {
      const promotionsRef = collection(db, "promotions");
      const q = query(promotionsRef, where("productName", "==", product.name), where("active", "==", true));

      const querySnapshot = await getDocs(q);
      const currentDate = new Date();

      querySnapshot.forEach((doc) => {
        const promoData = doc.data();
        const startDate = new Date(promoData.startDate);
        const endDate = new Date(promoData.endDate);

        if (currentDate >= startDate && currentDate <= endDate) {
          console.log("Found active promotion:", promoData);
          setActivePromotion({ ...promoData, id: doc.id });
        }
      });
    } catch (error) {
      console.error("Error fetching promotion:", error);
    }
  };

  const calculatePrices = async (product: Product) => {
    try {
      const priceDocRef = doc(db, "priceData", "OTjdBq7kTmGMXWDpMKvg");
      const priceDocSnap = await getDoc(priceDocRef);

      if (!priceDocSnap.exists()) {
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
          basePrice = priceData.price18Karat;
          wastagePercentage = priceData.goldwastageCharges;
          makingChargesPerGram = priceData.goldmakingCharges;
          break;
        case "20 Karat":
          basePrice = priceData.price20Karat;
          wastagePercentage = priceData.goldwastageCharges;
          makingChargesPerGram = priceData.goldmakingCharges;
          break;
        case "22 Karat":
          basePrice = priceData.price22Karat;
          wastagePercentage = priceData.goldwastageCharges;
          makingChargesPerGram = priceData.goldmakingCharges;
          break;
        case "24 Karat":
          basePrice = priceData.price24Karat;
          applyWastageMakingCharges = false;
          break;
        case "Fine Silver-99.9%":
          basePrice = priceData.priceSilver1;
          wastagePercentage = priceData.wastageChargesSilver;
          makingChargesPerGram = priceData.makingChargesSilver;
          break;
        case "Sterling Silver-92.5%":
          basePrice = priceData.priceSilver2;
          wastagePercentage = priceData.wastageChargesSilver;
          makingChargesPerGram = priceData.makingChargesSilver;
          break;
        default:
          toast.error("Error: Invalid product purity");
          return;
      }

      const baseAmount = basePrice * product.weight;
      let totalPrice = baseAmount;
      let wastageCharges = 0;
      let makingCharges = 0;

      if (applyWastageMakingCharges) {
        wastageCharges = baseAmount * (wastagePercentage / 100);
        makingCharges = makingChargesPerGram * product.weight;
        totalPrice = baseAmount + wastageCharges + makingCharges;
      }

      setPriceBreakdown({
        baseAmount,
        wastageCharges,
        makingCharges,
        wastagePercentage,
        makingChargesPerGram,
      });

      setOriginalPrice(totalPrice);

      // Calculate promotion price if active promotion exists
      if (activePromotion) {
        const discountedBasePrice = basePrice * (1 - activePromotion.priceDiscount / 100);
        const discountedWastage = applyWastageMakingCharges
          ? baseAmount * ((wastagePercentage * (1 - activePromotion.wastageDiscount / 100)) / 100)
          : 0;
        const discountedMaking = applyWastageMakingCharges
          ? makingChargesPerGram * (1 - activePromotion.makingChargesDiscount / 100) * product.weight
          : 0;

        const promotionalPrice = discountedBasePrice * product.weight + discountedWastage + discountedMaking;
        setPromotionPrice(promotionalPrice);
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
