// import { useState, useEffect } from "react";
// import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { toast } from "sonner";
// import ProductImage from "./card/ProductImage";
// import ProductInfo from "./card/ProductInfo";
// import ProductPrice from "./card/ProductPrice";

// interface Product {
//   name: string;
//   category: string;
//   weight: number;
//   imageUrl: string;
// }

// interface ProductCardProps {
//   product: Product;
//   onAddToWishlist: (product: Product) => void;
//   isInWishlist: boolean;
// }

// const ProductCard = ({ product, onAddToWishlist, isInWishlist }: ProductCardProps) => {
//   const [originalPrice, setOriginalPrice] = useState<number | null>(null);
//   const [promotionPrice, setPromotionPrice] = useState<number | null>(null);
//   const [activePromotion, setActivePromotion] = useState<any>(null);
//   const [showPrice, setShowPrice] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     console.log("ProductCard mounted for:", product.name);
//     fetchPromotionDetails();
//     return () => {
//       setOriginalPrice(null);
//       setPromotionPrice(null);
//       setActivePromotion(null);
//       setShowPrice(false);
//     };
//   }, [product.name]);

//   const fetchPromotionDetails = async () => {
//     try {
//       console.log("Fetching promotions for:", product.name);
//       const promotionsRef = collection(db, "promotions");
//       const q = query(
//         promotionsRef,
//         where("productName", "==", product.name),
//         where("active", "==", true)
//       );
      
//       const querySnapshot = await getDocs(q);
//       const currentDate = new Date();
//       let foundActivePromotion = false;
      
//       querySnapshot.forEach((doc) => {
//         const promoData = doc.data();
//         const startDate = new Date(promoData.startDate);
//         const endDate = new Date(promoData.endDate);
        
//         if (currentDate >= startDate && currentDate <= endDate) {
//           console.log("Found active promotion for", product.name, ":", promoData);
//           setActivePromotion({ ...promoData, id: doc.id });
//           foundActivePromotion = true;
//         }
//       });

//       if (!foundActivePromotion) {
//         setActivePromotion(null);
//       }
//     } catch (error) {
//       console.error("Error fetching promotion:", error);
//       toast.error("Error fetching promotion details");
//     }
//   };

//   const calculatePrices = async () => {
//     setIsLoading(true);
//     try {
//       const priceDocRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
//       const priceDocSnap = await getDoc(priceDocRef);
      
//       if (!priceDocSnap.exists()) {
//         console.error("Price data not found");
//         toast.error("Error: Price data not available");
//         return;
//       }

//       const priceData = priceDocSnap.data();
//       let basePrice = 0;
//       let applyWastageMakingCharges = true;
//       let wastagePercentage = 0;
//       let makingChargesPerGram = 0;

//       switch (product.category) {
//         case "18 Karat":
//           basePrice = priceData.price18Karat;
//           wastagePercentage = priceData.goldwastageCharges;
//           makingChargesPerGram = priceData.goldmakingCharges;
//           break;
//         case "20 Karat":
//           basePrice = priceData.price20Karat;
//           wastagePercentage = priceData.goldwastageCharges;
//           makingChargesPerGram = priceData.goldmakingCharges;
//           break;
//         case "22 Karat":
//           basePrice = priceData.price22Karat;
//           wastagePercentage = priceData.goldwastageCharges;
//           makingChargesPerGram = priceData.goldmakingCharges;
//           break;
//         case "24 Karat":
//           basePrice = priceData.price24Karat;
//           applyWastageMakingCharges = false;
//           break;
//         case "Silver 1":
//           basePrice = priceData.priceSilver1;
//           wastagePercentage = priceData.wastageChargesSilver;
//           makingChargesPerGram = priceData.makingChargesSilver;
//           break;
//         case "Silver 2":
//           basePrice = priceData.priceSilver2;
//           wastagePercentage = priceData.wastageChargesSilver;
//           makingChargesPerGram = priceData.makingChargesSilver;
//           break;
//         default:
//           console.error("Invalid category:", product.category);
//           toast.error("Error: Invalid product category");
//           setIsLoading(false);
//           return;
//       }

//       // Calculate base amount
//       const baseAmount = basePrice * product.weight;
//       let totalPrice = baseAmount;

//       if (applyWastageMakingCharges) {
//         // Calculate wastage charges
//         const wastageCharges = (baseAmount * wastagePercentage) / 100;
//         // Calculate making charges directly based on weight
//         const makingCharges = product.weight * makingChargesPerGram;

//         console.log("Original price calculations:", {
//           baseAmount,
//           wastageCharges,
//           makingCharges,
//           wastagePercentage,
//           makingChargesPerGram,
//           weight: product.weight,
//           totalBeforeCharges: baseAmount,
//           finalTotal: baseAmount + wastageCharges + makingCharges
//         });

//         totalPrice = baseAmount + wastageCharges + makingCharges;
//       }

//       setOriginalPrice(totalPrice);

//       if (activePromotion) {
//         // Calculate promotional price
//         const discountedBasePrice = basePrice * (1 - (activePromotion.priceDiscount / 100));
//         const discountedBaseAmount = discountedBasePrice * product.weight;
//         let promotionalPrice = discountedBaseAmount;

//         if (applyWastageMakingCharges) {
//           // Calculate discounted wastage charges
//           const discountedWastage = (discountedBaseAmount * wastagePercentage * (1 - (activePromotion.wastageDiscount / 100))) / 100;
//           // Calculate discounted making charges directly based on weight
//           const discountedMaking = product.weight * makingChargesPerGram * (1 - (activePromotion.makingChargesDiscount / 100));
          
//           promotionalPrice = discountedBaseAmount + discountedWastage + discountedMaking;

//           console.log("Promotional price calculations:", {
//             discountedBasePrice,
//             discountedBaseAmount,
//             discountedWastage,
//             discountedMaking,
//             finalPromotionalPrice: promotionalPrice,
//             originalPrice: totalPrice,
//             discounts: {
//               price: activePromotion.priceDiscount,
//               wastage: activePromotion.wastageDiscount,
//               making: activePromotion.makingChargesDiscount
//             }
//           });
//         }

//         setPromotionPrice(promotionalPrice);
//       } else {
//         setPromotionPrice(null);
//       }
//     } catch (error) {
//       console.error("Error calculating prices:", error);
//       toast.error("Error calculating product prices");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCheckPrice = () => {
//     setShowPrice(true);
//     calculatePrices();
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-primary/20">
//       <ProductImage
//         imageUrl={product.imageUrl}
//         name={product.name}
//         isInWishlist={isInWishlist}
//         onAddToWishlist={() => onAddToWishlist(product)}
//         hasActivePromotion={!!activePromotion}
//       />
//       <div className="p-6">
//         <ProductInfo
//           name={product.name}
//           category={product.category}
//           weight={product.weight}
//         />
//         <ProductPrice
//           showPrice={showPrice}
//           isLoading={isLoading}
//           originalPrice={originalPrice}
//           promotionPrice={promotionPrice}
//           activePromotion={activePromotion}
//           onCheckPrice={handleCheckPrice}
//           productName={product.name}
//         />
//       </div>
//     </div>
//   );
// };

// export default ProductCard;
import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import ProductImage from "./card/ProductImage";
import ProductInfo from "./card/ProductInfo";
import ProductPrice from "./card/ProductPrice";

interface Product {
  name: string;
  category: string;
  weight: number;
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
  onAddToWishlist: (product: Product) => void;
  isInWishlist: boolean;
}

const ProductCard = ({ product, onAddToWishlist, isInWishlist }: ProductCardProps) => {
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [promotionPrice, setPromotionPrice] = useState<number | null>(null);
  const [activePromotion, setActivePromotion] = useState<any>(null);
  const [showPrice, setShowPrice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("ProductCard mounted for:", product.name);
    fetchPromotionDetails();
    return () => {
      setOriginalPrice(null);
      setPromotionPrice(null);
      setActivePromotion(null);
      setShowPrice(false);
    };
  }, [product.name]);

  const fetchPromotionDetails = async () => {
    try {
      console.log("Fetching promotions for:", product.name);
      const promotionsRef = collection(db, "promotions");
      const q = query(
        promotionsRef,
        where("productName", "==", product.name),
        where("active", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      const currentDate = new Date();
      let foundActivePromotion = false;
      
      querySnapshot.forEach((doc) => {
        const promoData = doc.data();
        const startDate = new Date(promoData.startDate);
        const endDate = new Date(promoData.endDate);
        
        if (currentDate >= startDate && currentDate <= endDate) {
          console.log("Found active promotion for", product.name, ":", promoData);
          setActivePromotion({ ...promoData, id: doc.id });
          foundActivePromotion = true;
        }
      });

      if (!foundActivePromotion) {
        setActivePromotion(null);
      }
    } catch (error) {
      console.error("Error fetching promotion:", error);
      toast.error("Error fetching promotion details");
    }
  };

  const calculatePrices = async () => {
    setIsLoading(true);
    try {
      const priceDocRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
      const priceDocSnap = await getDoc(priceDocRef);
      
      if (!priceDocSnap.exists()) {
        console.error("Price data not found");
        toast.error("Error: Price data not available");
        return;
      }

      const priceData = priceDocSnap.data();
      let basePricePerGram = 0;
      let applyWastageMakingCharges = true;
      let wastagePercentage = 0;
      let makingChargesPerGram = 0;

      switch (product.category) {
        case "18 Karat":
          basePricePerGram = priceData.price18Karat;
          wastagePercentage = priceData.goldwastageCharges;
          makingChargesPerGram = priceData.goldmakingCharges;
          break;
        case "20 Karat":
          basePricePerGram = priceData.price20Karat;
          wastagePercentage = priceData.goldwastageCharges;
          makingChargesPerGram = priceData.goldmakingCharges;
          break;
        case "22 Karat":
          basePricePerGram = priceData.price22Karat;
          wastagePercentage = priceData.goldwastageCharges;
          makingChargesPerGram = priceData.goldmakingCharges;
          break;
        case "24 Karat":
          basePricePerGram = priceData.price24Karat;
          applyWastageMakingCharges = false;
          break;
        case "Silver 1":
          basePricePerGram = priceData.priceSilver1;
          wastagePercentage = priceData.wastageChargesSilver;
          makingChargesPerGram = priceData.makingChargesSilver;
          break;
        case "Silver 2":
          basePricePerGram = priceData.priceSilver2;
          wastagePercentage = priceData.wastageChargesSilver;
          makingChargesPerGram = priceData.makingChargesSilver;
          break;
        default:
          console.error("Invalid category:", product.category);
          toast.error("Error: Invalid product category");
          setIsLoading(false);
          return;
      }

      // Calculate base amount (total base price)
      const baseAmount = basePricePerGram * product.weight;
      let totalPrice = baseAmount;

      if (applyWastageMakingCharges) {
        // Calculate wastage charges based on original base amount
        const wastageCharges = (baseAmount * wastagePercentage) / 100;
        // Calculate making charges directly based on weight
        const makingCharges = product.weight * makingChargesPerGram;

        console.log("Original price calculations:", {
          baseAmount,
          wastageCharges,
          makingCharges,
          wastagePercentage,
          makingChargesPerGram,
          weight: product.weight,
          totalBeforeCharges: baseAmount,
          finalTotal: baseAmount + wastageCharges + makingCharges
        });

        totalPrice = baseAmount + wastageCharges + makingCharges;
      }

      setOriginalPrice(totalPrice);

      if (activePromotion) {
        // Calculate promotional price

        // 1. Apply discount on base price per gram and compute discounted base amount
        const discountedBasePricePerGram = basePricePerGram * (1 - (activePromotion.priceDiscount / 100));
        const discountedBaseAmount = discountedBasePricePerGram * product.weight;

        let promotionalPrice = discountedBaseAmount;

        if (applyWastageMakingCharges) {
          // 2. Calculate discounted wastage on the original base amount, not on discounted base amount
          const originalWastage = (baseAmount * wastagePercentage) / 100;
          const discountedWastage = originalWastage * (1 - (activePromotion.wastageDiscount / 100));
          // 3. Calculate discounted making charges directly based on weight
          const discountedMaking = product.weight * makingChargesPerGram * (1 - (activePromotion.makingChargesDiscount / 100));
          
          promotionalPrice = discountedBaseAmount + discountedWastage + discountedMaking;

          console.log("Promotional price calculations:", {
            discountedBasePricePerGram,
            discountedBaseAmount,
            originalWastage,
            discountedWastage,
            discountedMaking,
            finalPromotionalPrice: promotionalPrice,
            originalPrice: totalPrice,
            discounts: {
              price: activePromotion.priceDiscount,
              wastage: activePromotion.wastageDiscount,
              making: activePromotion.makingChargesDiscount
            }
          });
        }

        setPromotionPrice(promotionalPrice);
      } else {
        setPromotionPrice(null);
      }
    } catch (error) {
      console.error("Error calculating prices:", error);
      toast.error("Error calculating product prices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckPrice = () => {
    setShowPrice(true);
    calculatePrices();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-primary/20">
      <ProductImage
        imageUrl={product.imageUrl}
        name={product.name}
        isInWishlist={isInWishlist}
        onAddToWishlist={() => onAddToWishlist(product)}
        hasActivePromotion={!!activePromotion}
      />
      <div className="p-6">
        <ProductInfo
          name={product.name}
          category={product.category}
          weight={product.weight}
        />
        <ProductPrice
          showPrice={showPrice}
          isLoading={isLoading}
          originalPrice={originalPrice}
          promotionPrice={promotionPrice}
          activePromotion={activePromotion}
          onCheckPrice={handleCheckPrice}
          productName={product.name}
        />
      </div>
    </div>
  );
};

export default ProductCard;
