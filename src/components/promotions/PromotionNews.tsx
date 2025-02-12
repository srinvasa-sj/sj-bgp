// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// interface Promotion {
//   promotionName: string;
//   startDate: string;
//   endDate: string;
//   giftDescription: string;
//   priceDiscount: number;
//   wastageDiscount: number;
//   makingChargesDiscount: number;
// }

// export const PromotionNews = () => {
//   const [promotions, setPromotions] = useState<Promotion[]>([]);

//   useEffect(() => {
//     const fetchPromotions = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "promotions"));
//         const activePromotions = querySnapshot.docs
//           .map(doc => {
//             const data = doc.data();
//             return {
//               promotionName: data.promotionName,
//               startDate: data.startDate,
//               endDate: data.endDate,
//               giftDescription: data.giftDescription,
//               priceDiscount: data.priceDiscount,
//               wastageDiscount: data.wastageDiscount,
//               makingChargesDiscount: data.makingChargesDiscount
//             };
//           })
//           .filter((promo: Promotion) => {
//             const now = new Date();
//             const start = new Date(promo.startDate);
//             const end = new Date(promo.endDate);
//             return start <= now && end >= now;
//           });

//         console.log("Active promotions:", activePromotions);
//         setPromotions(activePromotions);
//       } catch (error) {
//         console.error("Error fetching promotions:", error);
//       }
//     };

//     fetchPromotions();
//   }, []);

//   if (promotions.length === 0) return null;

//   return (
//     <div className="bg-primary/10 p-2 overflow-hidden mb-4 rounded-lg">
//       <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap">
//         {promotions.map((promo, index) => (
//           <span key={index} className="inline-block mx-4">
//             🎉 {promo.promotionName} | Valid till: {new Date(promo.endDate).toLocaleDateString()} | 
//             Gift: {promo.giftDescription} | 
//             Discounts: Price {promo.priceDiscount}%, 
//             Wastage {promo.wastageDiscount}%, 
//             Making {promo.makingChargesDiscount}%
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// };

//------------------ test code--------//
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Promotion {
  promotionName: string;
  startDate: string;
  endDate: string;
  giftDescription: string;
  priceDiscount: number;
  wastageDiscount: number;
  makingChargesDiscount: number;
}

export const PromotionNews = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "promotions"));
        const activePromotions = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              promotionName: data.promotionName,
              startDate: data.startDate,
              endDate: data.endDate,
              giftDescription: data.giftDescription,
              priceDiscount: data.priceDiscount,
              wastageDiscount: data.wastageDiscount,
              makingChargesDiscount: data.makingChargesDiscount
            };
          })
          .filter((promo: Promotion) => {
            const now = new Date();
            const start = new Date(promo.startDate);
            const end = new Date(promo.endDate);
            return start <= now && end >= now;
          });

        setPromotions(activePromotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (promotions.length === 0) return null;

  return (
    <div className="bg-primary/10 p-2 overflow-hidden mb-4 rounded-lg">
      <div
        className="whitespace-nowrap"
        style={{
          animation: `marquee ${isMobile ? "40s" : "20s"} linear infinite`
        }}
      >
        {promotions.map((promo, index) => (
          <span key={index} className="inline-block mx-4">
            🎉 {promo.promotionName} | Valid till: {new Date(promo.endDate).toLocaleDateString()} | 
            Gift: {promo.giftDescription} | 
            Discounts: Price {promo.priceDiscount}%, 
            Wastage {promo.wastageDiscount}%, 
            Making {promo.makingChargesDiscount}%
          </span>
        ))}
      </div>
    </div>
  );
};

