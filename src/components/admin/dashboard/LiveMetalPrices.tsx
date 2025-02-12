
//------------------------------------------------------- goldAPI- not working now----------//
// import { useQuery } from "@tanstack/react-query";
// import { useEffect } from "react";
// import { Card } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";

// // Define our desired metal price structure.
// interface MetalPrice {
//   gold: {
//     k24: number;
//     k22: number;
//     k20: number;
//     k18: number;
//   };
//   silver: {
//     fine: number;
//     sterling: number;
//     coin: number;
//   };
// }

// const LiveMetalPrices = () => {
//   // Use React Query to fetch the metal prices.
//   // (Note: We no longer use refetchInterval since we schedule our own refetch.)
//   const {
//     data: prices,
//     isLoading,
//     error,
//     refetch,
//   } = useQuery<MetalPrice>({
//     queryKey: ["metalPrices"],
//     queryFn: async () => {
//       console.log("Fetching metal prices from GoldAPI...");

//       // Endpoints for gold and silver.
//       const goldUrl = "https://www.goldapi.io/api/XAU/INR";
//       const silverUrl = "https://www.goldapi.io/api/XAG/INR";

//       const headers = {
//         //"x-access-token": "goldapi-1vts119m6ri8n8a-io", // Your API key
//        "x-access-token": "goldapi-8hr888sm6rwlcjo-io", // Your API key

//         "Content-Type": "application/json",
//       };

//       // Execute both requests in parallel.
//       const [goldRes, silverRes] = await Promise.all([
//         fetch(goldUrl, { headers }),
//         fetch(silverUrl, { headers }),
//       ]);

//       if (!goldRes.ok || !silverRes.ok) {
//         throw new Error("Failed to fetch metal prices");
//       }

//       // Parse the JSON responses.
//       const goldData = await goldRes.json();
//       const silverData = await silverRes.json();

//       console.log("Raw GoldAPI gold response:", goldData);
//       console.log("Raw GoldAPI silver response:", silverData);

//       // GoldAPI returns the price per ounce.
//       // Convert to per gram (1 ounce ≈ 31.1035 grams).
//       const conversionFactor = 31.1035;
//       const goldPricePerOunce: number = goldData.price;
//       const goldPricePerGram = goldPricePerOunce / conversionFactor;

//       const silverPricePerOunce: number = silverData.price;
//       const silverPricePerGram = silverPricePerOunce / conversionFactor;

//       // Calculate prices for different purities.
//       const metalPrices: MetalPrice = {
//         gold: {
//           k24: goldPricePerGram,
//           k22: goldPricePerGram * (22 / 24),
//           k20: goldPricePerGram * (20 / 24),
//           k18: goldPricePerGram * (18 / 24),
//         },
//         silver: {
//           fine: silverPricePerGram,
//           sterling: silverPricePerGram * 0.925,
//           coin: silverPricePerGram * 0.90,
//         },
//       };

//       return metalPrices;
//     },
//     // No continuous refetchInterval; we will schedule a daily refetch.
//     refetchOnWindowFocus: false,
//     staleTime: 1000 * 60 * 60 * 24, // Data is considered fresh for 24 hours
//     refetchInterval: 1000 * 60 * 60 * 4, // Refetch every 4 hours
//   });

//   // Set up an effect to schedule a refetch at the next 8 AM (and then every 24 hours).
//   useEffect(() => {
//     // Calculate the next occurrence of 8 AM.
//     const now = new Date();
//     const next8AM = new Date(now);
//     next8AM.setHours(8, 0, 0, 0);

//     // If it's already past 8 AM today, schedule for tomorrow.
//     if (now >= next8AM) {
//       next8AM.setDate(next8AM.getDate() + 1);
//     }

//     const delay = next8AM.getTime() - now.getTime();
//     console.log("Next refetch scheduled in", delay, "ms");

//     // Set a one-time timeout for the next 8 AM.
//     const timeoutId = setTimeout(() => {
//       refetch(); // perform a refetch at 8 AM
//       console.log("Refetching metal prices at 8 AM...");

//       // After the first refetch at 8 AM, set an interval to refetch every 24 hours.
//       const intervalId = setInterval(() => {
//         refetch();
//         console.log("Refetching metal prices (daily at 8 AM)...");
//       }, 24 * 60 * 60 * 1000);

//       // Clean up the interval if needed when the component unmounts.
//       return () => clearInterval(intervalId);
//     }, delay);

//     return () => clearTimeout(timeoutId);
//   }, [refetch]);

//   if (error) {
//     console.error("Error fetching metal prices:", error);
//     return (
//       <div className="text-red-500">
//         Error loading metal prices. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold">Live Metal Prices</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Gold Prices */}
//         <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
//           <h3 className="text-xl font-semibold mb-4 text-yellow-800">
//             Gold Prices (per gram)
//           </h3>
//           <div className="space-y-3">
//             {isLoading ? (
//               Array(4)
//                 .fill(0)
//                 .map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
//             ) : (
//               <>
//                 <div className="flex justify-between items-center">
//                   <span className="text-yellow-700">24K (100%)</span>
//                   <span className="font-semibold">
//                     ₹{prices?.gold.k24.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-yellow-700">22K (91.6%)</span>
//                   <span className="font-semibold">
//                     ₹{prices?.gold.k22.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-yellow-700">20K (83.3%)</span>
//                   <span className="font-semibold">
//                     ₹{prices?.gold.k20.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-yellow-700">18K (75%)</span>
//                   <span className="font-semibold">
//                     ₹{prices?.gold.k18.toFixed(2)}
//                   </span>
//                 </div>
//               </>
//             )}
//           </div>
//         </Card>

//         {/* Silver Prices */}
//         <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800">
//             Silver Prices (per gram)
//           </h3>
//           <div className="space-y-3">
//             {isLoading ? (
//               Array(3)
//                 .fill(0)
//                 .map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
//             ) : (
//               <>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-700">Fine Silver (999%)</span>
//                   <span className="font-semibold">
//                     ₹{prices?.silver.fine.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-700">
//                     Sterling Silver (92.5%)
//                   </span>
//                   <span className="font-semibold">
//                     ₹{prices?.silver.sterling.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-700">Coin Silver (90%)</span>
//                   <span className="font-semibold">
//                     ₹{prices?.silver.coin.toFixed(2)}
//                   </span>
//                 </div>
//               </>
//             )}
//           </div>
//         </Card>
//       </div>
//       <p className="text-sm text-gray-500 mt-2">
//         * Prices are updated daily at 8 AM. Last updated:{" "}
//         {new Date().toLocaleTimeString()}
//       </p>
//     </div>
//   );
// };

// export default LiveMetalPrices;


//-------------------------------------------------------------//




//////////////////////////////////////
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetalPrice {
  gold: {
    k24: number;
    k22: number;
    k20: number;
    k18: number;
  };
  silver: {
    fine: number;
    sterling: number;
    coin: number;
  };
}

const LiveMetalPrices = () => {
  const goldId = "pax-gold";
  const silverId = "silver"; // Correct identifier for silver in CoinGecko
  const currency = "inr"; // INR for Indian Rupee

  const { data: prices, isLoading, error, refetch } = useQuery<MetalPrice>({
    queryKey: ["metalPrices"],
    queryFn: async () => {
      console.log("Fetching metal prices from CoinGecko...");

      const goldUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${goldId}&vs_currencies=${currency}`;
      const silverUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${silverId}&vs_currencies=usd`; // Fetch silver in USD
      const usdToInrUrl = `https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=${currency}`;

      const [goldRes, silverRes, usdToInrRes] = await Promise.all([
        fetch(goldUrl),
        fetch(silverUrl),
        fetch(usdToInrUrl),
      ]);

      if (!goldRes.ok || !silverRes.ok || !usdToInrRes.ok) {
        throw new Error("Failed to fetch metal prices");
      }

      const goldData = await goldRes.json();
      const silverData = await silverRes.json();
      const usdToInrData = await usdToInrRes.json();

      console.log("Raw CoinGecko response for gold:", goldData);
      console.log("Raw CoinGecko response for silver:", silverData);
      console.log("Raw CoinGecko response for USD to INR:", usdToInrData);

      // Check for valid data
      if (!goldData[goldId]?.inr) {
        throw new Error("Gold price data not available");
      }
      
      // Handle invalid silver data
      let silverPricePerOunceInUSD = 0;
      if (silverData[silverId]?.usd) {
        // Check if silver price is close to zero and replace with fallback value
        if (silverData[silverId].usd < 0.1) {
          console.error("Silver price is too low or invalid, using fallback.");
          silverPricePerOunceInUSD = 25; // Fallback value
        } else {
          silverPricePerOunceInUSD = silverData[silverId].usd;
        }
      } else {
        console.error("Silver price not available from CoinGecko, using fallback.");
        silverPricePerOunceInUSD = 25; // Fallback value
      }

      if (!usdToInrData?.usd?.inr) {
        throw new Error("USD to INR conversion rate not available");
      }

      // Extract gold price per ounce, silver price per ounce (in USD), and USD to INR rate
      const goldPricePerOunce: number = goldData[goldId].inr;
      const usdToInrRate: number = usdToInrData.usd.inr;

      const conversionFactor = 31.1035; // 1 ounce ≈ 31.1035 grams
      const goldPricePerGram = goldPricePerOunce / conversionFactor;
      const silverPricePerGramInUSD = silverPricePerOunceInUSD / conversionFactor;

      // Convert silver price from USD to INR
      const silverPricePerGramInINR = silverPricePerGramInUSD * usdToInrRate;

      // Calculate prices for different purities.
      const metalPrices: MetalPrice = {
        gold: {
          k24: goldPricePerGram,
          k22: goldPricePerGram * (22 / 24),
          k20: goldPricePerGram * (20 / 24),
          k18: goldPricePerGram * (18 / 24),
        },
        silver: {
          fine: silverPricePerGramInINR,
          sterling: silverPricePerGramInINR * 0.925,
          coin: silverPricePerGramInINR * 0.90,
        },
      };

      return metalPrices;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 24, // Data is considered fresh for 24 hours
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 min
  });

  if (error) {
    console.error("Error fetching metal prices:", error);
    return (
      <div className="text-red-500">
        Error loading metal prices. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Live Metal Prices</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gold Prices */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <h3 className="text-xl font-semibold mb-4 text-yellow-800">
            Gold Prices (per gram)
          </h3>
          <div className="space-y-3">
            {isLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-700">24K (100%)</span>
                  <span className="font-semibold">₹{prices?.gold.k24.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-700">22K (91.6%)</span>
                  <span className="font-semibold">₹{prices?.gold.k22.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-700">20K (83.3%)</span>
                  <span className="font-semibold">₹{prices?.gold.k20.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-700">18K (75%)</span>
                  <span className="font-semibold">₹{prices?.gold.k18.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Silver Prices */}
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Silver Prices (per gram)
          </h3>
          <div className="space-y-3">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Fine Silver (999%)</span>
                  <span className="font-semibold">₹{prices?.silver.fine.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Sterling Silver (92.5%)</span>
                  <span className="font-semibold">₹{prices?.silver.sterling.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Coin Silver (90%)</span>
                  <span className="font-semibold">₹{prices?.silver.coin.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      <p className="text-sm text-gray-900 mt-2">
        * Prices are updated every 5 minutes. Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default LiveMetalPrices;





