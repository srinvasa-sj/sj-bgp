// import { useState, useEffect } from "react";
// import { getDoc, doc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { PromotionNews } from "@/components/promotions/PromotionNews";

// const Home = () => {
//   const [priceData, setPriceData] = useState<any>(null);
//   const [result, setResult] = useState<string>("");
//   const [formData, setFormData] = useState({
//     goldType: "",
//     goldWeight: "",
//     silverType: "",
//     silverWeight: "",
//   });

//   useEffect(() => {
//     const fetchPriceData = async () => {
//       try {
//         const docRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           setPriceData(docSnap.data());
//         }
//       } catch (error) {
//         console.error("Error fetching price data:", error);
//       }
//     };
//     fetchPriceData();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.goldType && !formData.silverType) {
//       setResult("Please select a gold or silver type");
//       return;
//     }

//     try {
//       const docRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         const priceData = docSnap.data();
//         let resultText = "";
//         let totalGoldPrice = 0;
//         let totalSilverPrice = 0;

//         if (formData.goldType && formData.goldWeight) {
//           const goldWeight = parseFloat(formData.goldWeight);
//           let goldPricePerGram = 0;
//           let applyWastageMakingCharges = true;

//           switch (formData.goldType) {
//             case "18-Karat":
//               goldPricePerGram = priceData.price18Karat;
//               break;
//             case "20-Karat":
//               goldPricePerGram = priceData.price20Karat;
//               break;
//             case "22-Karat":
//               goldPricePerGram = priceData.price22Karat;
//               break;
//             case "24-Karat":
//               goldPricePerGram = priceData.price24Karat;
//               applyWastageMakingCharges = false; // No wastage or making charges for 24-Karat
//               break;
//           }

//           const goldPriceForWeight = goldPricePerGram * goldWeight;

//           if (applyWastageMakingCharges) {
//             const wastageCharges = goldPriceForWeight * (priceData.goldwastageCharges / 100);
//             const makingCharges = priceData.goldmakingCharges * goldWeight;
//             totalGoldPrice = goldPriceForWeight + wastageCharges + makingCharges;

//             resultText += `
//               <div class="overflow-x-auto">
//                 <table class="min-w-full divide-y divide-gray-200 mb-4">
//                   <thead class="bg-gray-50">
//                     <tr>
//                       <th colspan="2" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gold Details</th>
//                     </tr>
//                   </thead>
//                   <tbody class="bg-white divide-y divide-gray-200">
//                     <tr>
//                       <td class="px-6 py-4 whitespace-nowrap">Type</td>
//                       <td class="px-6 py-4 whitespace-nowrap">${formData.goldType}</td>
//                     </tr>
//                     <tr>
//                       <td class="px-6 py-4 whitespace-nowrap">Weight</td>
//                       <td class="px-6 py-4 whitespace-nowrap">${goldWeight.toFixed(3)}g</td>
//                     </tr>
//                     <tr>
//                       <td class="px-6 py-4 whitespace-nowrap">Price per gram</td>
//                       <td class="px-6 py-4 whitespace-nowrap">₹${goldPricePerGram.toFixed(2)}</td>
//                     </tr>
//                     <tr>
//                       <td class="px-6 py-4 whitespace-nowrap">Wastage Charges (${priceData.goldwastageCharges}%)</td>
//                       <td class="px-6 py-4 whitespace-nowrap">₹${(goldPriceForWeight * (priceData.goldwastageCharges / 100)).toFixed(2)}</td>
//                     </tr>
//                     <tr>
//                       <td class="px-6 py-4 whitespace-nowrap">Making Charges</td>
//                       <td class="px-6 py-4 whitespace-nowrap">₹${(priceData.goldmakingCharges * goldWeight).toFixed(2)}</td>
//                     </tr>
//                     <tr class="bg-gray-50">
//                       <td class="px-6 py-4 whitespace-nowrap font-bold">Total Gold Price</td>
//                       <td class="px-6 py-4 whitespace-nowrap font-bold">₹${totalGoldPrice.toFixed(2)}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             `;
//           } else {
//             totalGoldPrice = goldPriceForWeight; // Just price for 24-Karat gold, no wastage or making charges
//             resultText += `
//               <div class="overflow-x-auto">
//                 <table class="min-w-full divide-y divide-gray-200 mb-4">
//                   <thead class="bg-gray-50">
//                     <tr>
//                       <th colspan="2" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gold Details</th>
//                     </tr>
//                   </thead>
//                   <tbody class="bg-white divide-y divide-gray-200">
//                     <tr>
//                       <td class="px-6 py-4 whitespace-nowrap">Type</td>
//                       <td class="px-6 py-4 whitespace-nowrap">${formData.goldType}</td>
//                     </tr>
//                     <tr>
//                       <td class="px-6 py-4 whitespace-nowrap">Weight</td>
//                       <td class="px-6 py-4 whitespace-nowrap">${goldWeight.toFixed(3)}g</td>
//                     </tr>
//                     <tr>
//                       <td class="px-6 py-4 whitespace-nowrap">Price per gram</td>
//                       <td class="px-6 py-4 whitespace-nowrap">₹${goldPricePerGram.toFixed(2)}</td>
//                     </tr>
//                     <tr class="bg-gray-50">
//                       <td class="px-6 py-4 whitespace-nowrap font-bold">Total Gold Price</td>
//                       <td class="px-6 py-4 whitespace-nowrap font-bold">₹${totalGoldPrice.toFixed(2)}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             `;
//           }
//         }

//         if (formData.silverType && formData.silverWeight) {
//           const silverWeight = parseFloat(formData.silverWeight);
//           let silverPricePerGram = formData.silverType === "silver-1" 
//             ? priceData.priceSilver1 
//             : priceData.priceSilver2;

//           const silverPriceForWeight = silverPricePerGram * silverWeight;
//           const wastageCharges = silverPriceForWeight * (priceData.wastageChargesSilver / 100);
//           const makingCharges = priceData.makingChargesSilver * silverWeight;
//           totalSilverPrice = silverPriceForWeight + wastageCharges + makingCharges;

//           resultText += `
//             <div class="overflow-x-auto">
//               <table class="min-w-full divide-y divide-gray-200 mb-4">
//                 <thead class="bg-gray-50">
//                   <tr>
//                     <th colspan="2" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Silver Details</th>
//                   </tr>
//                 </thead>
//                 <tbody class="bg-white divide-y divide-gray-200">
//                   <tr>
//                     <td class="px-6 py-4 whitespace-nowrap">Type</td>
//                     <td class="px-6 py-4 whitespace-nowrap">${formData.silverType}</td>
//                   </tr>
//                   <tr>
//                     <td class="px-6 py-4 whitespace-nowrap">Weight</td>
//                     <td class="px-6 py-4 whitespace-nowrap">${silverWeight.toFixed(3)}g</td>
//                   </tr>
//                   <tr>
//                     <td class="px-6 py-4 whitespace-nowrap">Price per gram</td>
//                     <td class="px-6 py-4 whitespace-nowrap">₹${silverPricePerGram.toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td class="px-6 py-4 whitespace-nowrap">Wastage Charges (${priceData.wastageChargesSilver}%)</td>
//                     <td class="px-6 py-4 whitespace-nowrap">₹${wastageCharges.toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td class="px-6 py-4 whitespace-nowrap">Making Charges</td>
//                     <td className="px-6 py-4 whitespace-nowrap">₹${makingCharges.toFixed(2)}</td>
//                   </tr>
//                   <tr class="bg-gray-50">
//                     <td class="px-6 py-4 whitespace-nowrap font-bold">Total Silver Price</td>
//                     <td class="px-6 py-4 whitespace-nowrap font-bold">₹${totalSilverPrice.toFixed(2)}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           `;
//         }

//         const grossTotal = totalGoldPrice + totalSilverPrice;
//         resultText += `
//           <div class="overflow-x-auto">
//             <table class="min-w-full divide-y divide-gray-200">
//               <tbody>
//                 <tr class="bg-gray-50">
//                   <td class="px-6 py-4 whitespace-nowrap font-bold">Gross Total</td>
//                   <td class="px-6 py-4 whitespace-nowrap font-bold">₹${grossTotal.toFixed(2)}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         `;
        
//         setResult(resultText);
//         setFormData({
//           goldType: "",
//           goldWeight: "",
//           silverType: "",
//           silverWeight: "",
//         });
//       }
//     } catch (error) {
//       console.error("Error calculating price:", error);
//       setResult("Error: Unable to calculate price");
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-8">
//       <PromotionNews />
//       {priceData && (
//         <div>
//           <h2 className="text-2xl font-bold mb-4">Today's Price Details /gram</h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {[
//               { label: "18K", value: priceData.price18Karat },
//               { label: "20K", value: priceData.price20Karat },
//               { label: "22K", value: priceData.price22Karat },
//               { label: "24K", value: priceData.price24Karat },
//               { label: "Silver 1", value: priceData.priceSilver1 },
//               { label: "Silver 2", value: priceData.priceSilver2 },
//             ].map((item, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 hover:bg-primary/5"
//               >
//                 <h3 className="text-sm font-semibold text-gray-600">{item.label}</h3>
//                 <p className="text-lg font-bold text-primary">₹{item.value?.toFixed(2)}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       <div className="space-y-4">
//         <h1 className="text-4xl font-bold">Welcome to Srinivasa Jewellers</h1>
//         <p className="text-lg text-gray-600">
//           Where elegance meets craftsmanship. Explore our exquisite collection of fine gold jewelry, 
//           from timeless classics to unique statement pieces.
//         </p>
//       </div>

//       <div className="bg-card rounded-lg p-6 shadow-md">
//         <h2 className="text-2xl font-bold mb-6">Gold and Silver Price Calculator</h2>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-4">
//             <Label>Gold Type</Label>
//             <RadioGroup
//               value={formData.goldType}
//               onValueChange={(value) => setFormData({ ...formData, goldType: value })}
//               className="flex flex-wrap gap-4"
//             >
//               {["18-Karat", "20-Karat", "22-Karat", "24-Karat"].map((type) => (
//                 <div key={type} className="flex items-center space-x-2">
//                   <RadioGroupItem value={type} id={type} />
//                   <Label htmlFor={type}>{type}</Label>
//                 </div>
//               ))}
//             </RadioGroup>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="goldWeight">Gold Weight (in grams)</Label>
//             <Input
//               id="goldWeight"
//               type="number"
//               step="0.001"
//               value={formData.goldWeight}
//               onChange={(e) => setFormData({ ...formData, goldWeight: e.target.value })}
//             />
//           </div>

//           <div className="space-y-4">
//             <Label>Silver Type</Label>
//             <RadioGroup
//               value={formData.silverType}
//               onValueChange={(value) => setFormData({ ...formData, silverType: value })}
//               className="flex flex-wrap gap-4"
//             >
//               {["silver-1", "silver-2"].map((type) => (
//                 <div key={type} className="flex items-center space-x-2">
//                   <RadioGroupItem value={type} id={type} />
//                   <Label htmlFor={type}>{type.replace("-", " ").toUpperCase()}</Label>
//                 </div>
//               ))}
//             </RadioGroup>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="silverWeight">Silver Weight (in grams)</Label>
//             <Input
//               id="silverWeight"
//               type="number"
//               step="0.001"
//               value={formData.silverWeight}
//               onChange={(e) => setFormData({ ...formData, silverWeight: e.target.value })}
//             />
//           </div>

//           <Button 
//             type="submit" 
//             className="inline-flex items-center px-6 transition-all duration-300 hover:scale-105"
//           >
//             Calculate Price
//           </Button>
//         </form>

//         {result && (
//           <div className="mt-6 p-4 bg-muted rounded-lg" dangerouslySetInnerHTML={{ __html: result }} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;

//-------------------------------------------- optional code------------------//
// import { useState, useEffect } from "react";
// import { getDoc, doc, collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { PromotionNews } from "@/components/promotions/PromotionNews";
// import { toast } from "sonner";

// interface CustomerData {
//   id: string;
//   // other properties...
// }

// const Home = () => {
//   const [priceData, setPriceData] = useState<any>(null);
//   const [result, setResult] = useState<string>("");
//   const [formData, setFormData] = useState({
//     goldType: "",
//     goldWeight: "",
//     silverType: "",
//     silverWeight: "",
//   });

//   useEffect(() => {
//     const fetchPriceData = async () => {
//       try {
//         const docRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           setPriceData(docSnap.data());
//         }
//       } catch (error) {
//         console.error("Error fetching price data:", error);
//       }
//     };
//     fetchPriceData();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.goldType && !formData.silverType) {
//       setResult("Please select a gold or silver type");
//       return;
//     }

//     try {
//       const docRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         const priceData = docSnap.data();
//         let resultText = "";
//         let totalGoldPrice = 0;
//         let totalSilverPrice = 0;

//         // Calculate Gold Price if provided
//         if (formData.goldType && formData.goldWeight) {
//           const goldWeight = parseFloat(formData.goldWeight);
//           let goldPricePerGram = 0;
//           let applyWastageMakingCharges = true;

//           switch (formData.goldType) {
//             case "18-Karat":
//               goldPricePerGram = priceData.price18Karat;
//               break;
//             case "20-Karat":
//               goldPricePerGram = priceData.price20Karat;
//               break;
//             case "22-Karat":
//               goldPricePerGram = priceData.price22Karat;
//               break;
//             case "24-Karat":
//               goldPricePerGram = priceData.price24Karat;
//               applyWastageMakingCharges = false;
//               break;
//           }

//           const goldPriceForWeight = goldPricePerGram * goldWeight;

//           if (applyWastageMakingCharges) {
//             const wastageCharges = goldPriceForWeight * (priceData.goldwastageCharges / 100);
//             const makingCharges = priceData.goldmakingCharges * goldWeight;
//             totalGoldPrice = goldPriceForWeight + wastageCharges + makingCharges;

//             resultText += `
//               <div class="overflow-x-auto">
//                 <table class="min-w-full border-collapse border border-gray-400 mb-4">
//                   <thead class="bg-gray-200">
//                     <tr>
//                       <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase">Gold Details</th>
//                     </tr>
//                   </thead>
//                   <tbody class="bg-white">
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Type</td>
//                       <td class="px-4 py-2 text-sm">${formData.goldType}</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Weight</td>
//                       <td class="px-4 py-2 text-sm">${goldWeight.toFixed(3)}g</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Price per gram</td>
//                       <td class="px-4 py-2 text-sm">₹${goldPricePerGram.toFixed(2)}</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Wastage Charges (${priceData.goldwastageCharges}%)</td>
//                       <td class="px-4 py-2 text-sm">₹${(goldPriceForWeight * (priceData.goldwastageCharges / 100)).toFixed(2)}</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Making Charges</td>
//                       <td class="px-4 py-2 text-sm">₹${(priceData.goldmakingCharges * goldWeight).toFixed(2)}</td>
//                     </tr>
//                     <tr class="bg-gray-100 border border-gray-400">
//                       <td class="px-4 py-2 text-sm font-bold">Total Gold Price</td>
//                       <td class="px-4 py-2 text-sm font-bold">₹${totalGoldPrice.toFixed(2)}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             `;
//           } else {
//             totalGoldPrice = goldPriceForWeight;
//             resultText += `
//               <div class="overflow-x-auto">
//                 <table class="min-w-full border-collapse border border-gray-400 mb-4">
//                   <thead class="bg-gray-200">
//                     <tr>
//                       <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase">Gold Details</th>
//                     </tr>
//                   </thead>
//                   <tbody class="bg-white">
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Type</td>
//                       <td class="px-4 py-2 text-sm">${formData.goldType}</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Weight</td>
//                       <td class="px-4 py-2 text-sm">${goldWeight.toFixed(3)}g</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Price per gram</td>
//                       <td class="px-4 py-2 text-sm">₹${goldPricePerGram.toFixed(2)}</td>
//                     </tr>
//                     <tr class="bg-gray-100 border border-gray-400">
//                       <td class="px-4 py-2 text-sm font-bold">Total Gold Price</td>
//                       <td class="px-4 py-2 text-sm font-bold">₹${totalGoldPrice.toFixed(2)}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             `;
//           }
//         }

//         // Calculate Silver Price if provided
//         if (formData.silverType && formData.silverWeight) {
//           const silverWeight = parseFloat(formData.silverWeight);
//           let silverPricePerGram = formData.silverType === "silver-1" 
//             ? priceData.priceSilver1 
//             : priceData.priceSilver2;

//           const silverPriceForWeight = silverPricePerGram * silverWeight;
//           const wastageCharges = silverPriceForWeight * (priceData.wastageChargesSilver / 100);
//           const makingCharges = priceData.makingChargesSilver * silverWeight;
//           totalSilverPrice = silverPriceForWeight + wastageCharges + makingCharges;

//           resultText += `
//             <div class="overflow-x-auto">
//               <table class="min-w-full border-collapse border border-gray-400 mb-4">
//                 <thead class="bg-gray-200">
//                   <tr>
//                     <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase">Silver Details</th>
//                   </tr>
//                 </thead>
//                 <tbody class="bg-white">
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Type</td>
//                     <td class="px-4 py-2 text-sm">${formData.silverType}</td>
//                   </tr>
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Weight</td>
//                     <td class="px-4 py-2 text-sm">${silverWeight.toFixed(3)}g</td>
//                   </tr>
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Price per gram</td>
//                     <td class="px-4 py-2 text-sm">₹${silverPricePerGram.toFixed(2)}</td>
//                   </tr>
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Wastage Charges (${priceData.wastageChargesSilver}%)</td>
//                     <td class="px-4 py-2 text-sm">₹${wastageCharges.toFixed(2)}</td>
//                   </tr>
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Making Charges</td>
//                     <td class="px-4 py-2 text-sm">₹${makingCharges.toFixed(2)}</td>
//                   </tr>
//                   <tr class="bg-gray-100 border border-gray-400">
//                     <td class="px-4 py-2 text-sm font-bold">Total Silver Price</td>
//                     <td class="px-4 py-2 text-sm font-bold">₹${totalSilverPrice.toFixed(2)}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           `;
//         }

//         const grossTotal = (totalGoldPrice || 0) + (totalSilverPrice || 0);
//         resultText += `
//           <div class="overflow-x-auto">
//             <table class="min-w-full border-collapse border border-gray-400">
//               <tbody>
//                 <tr class="bg-gray-100 border border-gray-400">
//                   <td class="px-4 py-2 text-sm font-bold">Gross Total</td>
//                   <td class="px-4 py-2 text-sm font-bold">₹${grossTotal.toFixed(2)}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         `;

//         setResult(resultText);
//         setFormData({
//           goldType: "",
//           goldWeight: "",
//           silverType: "",
//           silverWeight: "",
//         });
//       }
//     } catch (error) {
//       console.error("Error calculating price:", error);
//       setResult("Error: Unable to calculate price");
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-8">
//       <PromotionNews />
//       {priceData && (
//         <div>
//           <h2 className="text-2xl font-bold mb-4">Today's Price Details /gram</h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {[
//               { label: "18K", value: priceData.price18Karat },
//               { label: "20K", value: priceData.price20Karat },
//               { label: "22K", value: priceData.price22Karat },
//               { label: "24K", value: priceData.price24Karat },
//               { label: "Silver 1", value: priceData.priceSilver1 },
//               { label: "Silver 2", value: priceData.priceSilver2 },
//             ].map((item, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 hover:bg-primary/5"
//               >
//                 <h3 className="text-sm font-semibold text-gray-600">{item.label}</h3>
//                 <p className="text-lg font-bold text-primary">₹{item.value?.toFixed(2)}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       <div className="space-y-4">
//         <h1 className="text-4xl font-bold">Welcome to Srinivasa Jewellers</h1>
//         <p className="text-lg text-gray-600">
//           Where elegance meets craftsmanship. Explore our exquisite collection of fine gold jewelry, 
//           from timeless classics to unique statement pieces.
//         </p>
//       </div>
//       <div className="bg-card rounded-lg p-6 shadow-md">
//         <h2 className="text-2xl font-bold mb-6">Gold and Silver Price Calculator</h2>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-4">
//             <Label>Gold Type</Label>
//             <RadioGroup
//               value={formData.goldType}
//               onValueChange={(value) => setFormData({ ...formData, goldType: value })}
//               className="flex flex-wrap gap-4"
//             >
//               {["18-Karat", "20-Karat", "22-Karat", "24-Karat"].map((type) => (
//                 <div key={type} className="flex items-center space-x-2">
//                   <RadioGroupItem value={type} id={type} />
//                   <Label htmlFor={type}>{type}</Label>
//                 </div>
//               ))}
//             </RadioGroup>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="goldWeight">Gold Weight (in grams)</Label>
//             <Input
//               id="goldWeight"
//               type="number"
//               step="0.001"
//               value={formData.goldWeight}
//               onChange={(e) => setFormData({ ...formData, goldWeight: e.target.value })}
//             />
//           </div>
//           <div className="space-y-4">
//             <Label>Silver Type</Label>
//             <RadioGroup
//               value={formData.silverType}
//               onValueChange={(value) => setFormData({ ...formData, silverType: value })}
//               className="flex flex-wrap gap-4"
//             >
//               {["silver-1", "silver-2"].map((type) => (
//                 <div key={type} className="flex items-center space-x-2">
//                   <RadioGroupItem value={type} id={type} />
//                   <Label htmlFor={type}>{type.replace("-", " ").toUpperCase()}</Label>
//                 </div>
//               ))}
//             </RadioGroup>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="silverWeight">Silver Weight (in grams)</Label>
//             <Input
//               id="silverWeight"
//               type="number"
//               step="0.001"
//               value={formData.silverWeight}
//               onChange={(e) => setFormData({ ...formData, silverWeight: e.target.value })}
//             />
//           </div>
//           <Button 
//             type="submit" 
//             className="inline-flex items-center px-6 transition-all duration-300 hover:scale-105"
//           >
//             Calculate Price
//           </Button>
//         </form>
//         {result && (
//           <div className="mt-6 p-4 bg-muted rounded-lg" dangerouslySetInnerHTML={{ __html: result }} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;

//------------------------------------------------------//
// import { useState, useEffect } from "react";
// import { getDoc, doc, collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { PromotionNews } from "@/components/promotions/PromotionNews";
// import { toast } from "sonner";

// interface CustomerData {
//   id: string;
//   // other properties...
// }

// const Home = () => {
//   const [priceData, setPriceData] = useState<any>(null);
//   const [result, setResult] = useState<string>("");
//   const [formData, setFormData] = useState({
//     goldType: "",
//     goldWeight: "",
//     silverType: "",
//     silverWeight: "",
//   });

//   useEffect(() => {
//     const fetchPriceData = async () => {
//       try {
//         const docRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           setPriceData(docSnap.data());
//         }
//       } catch (error) {
//         console.error("Error fetching price data:", error);
//       }
//     };
//     fetchPriceData();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.goldType && !formData.silverType) {
//       setResult("Please select a gold or silver type");
//       return;
//     }

//     try {
//       const docRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         const priceData = docSnap.data();
//         let resultText = "";
//         let totalGoldPrice = 0;
//         let totalSilverPrice = 0;

//         // Calculate Gold Price if provided
//         if (formData.goldType && formData.goldWeight) {
//           const goldWeight = parseFloat(formData.goldWeight);
//           let goldPricePerGram = 0;
//           let applyWastageMakingCharges = true;

//           switch (formData.goldType) {
//             case "18-Karat":
//               goldPricePerGram = priceData.price18Karat;
//               break;
//             case "20-Karat":
//               goldPricePerGram = priceData.price20Karat;
//               break;
//             case "22-Karat":
//               goldPricePerGram = priceData.price22Karat;
//               break;
//             case "24-Karat":
//               goldPricePerGram = priceData.price24Karat;
//               applyWastageMakingCharges = false;
//               break;
//           }

//           const goldPriceForWeight = goldPricePerGram * goldWeight;
//           if (applyWastageMakingCharges) {
//             const wastageChargesGold = goldPriceForWeight * (priceData.goldwastageCharges / 100);
//             const makingChargesGold = priceData.goldmakingCharges * goldWeight;
//             totalGoldPrice = goldPriceForWeight + wastageChargesGold + makingChargesGold;

//             resultText += `
//               <div class="overflow-x-auto">
//                 <table class="min-w-full border-collapse border border-gray-400 mb-4">
//                   <thead class="bg-gray-200">
//                     <tr>
//                       <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase tracking-wider">Gold Details</th>
//                     </tr>
//                   </thead>
//                   <tbody class="bg-white">
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Type</td>
//                       <td class="px-4 py-2 text-sm">${formData.goldType}</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Weight</td>
//                       <td class="px-4 py-2 text-sm">${goldWeight.toFixed(3)}g</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Price per gram</td>
//                       <td class="px-4 py-2 text-sm">₹${goldPricePerGram.toFixed(2)}</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Wastage Charges (${priceData.goldwastageCharges}%)</td>
//                       <td class="px-4 py-2 text-sm">₹${wastageChargesGold.toFixed(2)}</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Making Charges (₹${priceData.goldmakingCharges}/g)</td>
//                       <td class="px-4 py-2 text-sm">₹${makingChargesGold.toFixed(2)}</td>
//                     </tr>
//                     <tr class="bg-gray-100 border border-gray-400">
//                       <td class="px-4 py-2 text-sm font-bold">Total Gold Price</td>
//                       <td class="px-4 py-2 text-sm font-bold">₹${totalGoldPrice.toFixed(2)}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             `;
//           } else {
//             totalGoldPrice = goldPriceForWeight;
//             resultText += `
//               <div class="overflow-x-auto">
//                 <table class="min-w-full border-collapse border border-gray-400 mb-4">
//                   <thead class="bg-gray-200">
//                     <tr>
//                       <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase tracking-wider">Gold Details</th>
//                     </tr>
//                   </thead>
//                   <tbody class="bg-white">
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Type</td>
//                       <td class="px-4 py-2 text-sm">${formData.goldType}</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Weight</td>
//                       <td class="px-4 py-2 text-sm">${goldWeight.toFixed(3)}g</td>
//                     </tr>
//                     <tr class="border border-gray-400">
//                       <td class="px-4 py-2 text-sm">Price per gram</td>
//                       <td class="px-4 py-2 text-sm">₹${goldPricePerGram.toFixed(2)}</td>
//                     </tr>
//                     <tr class="bg-gray-100 border border-gray-400">
//                       <td class="px-4 py-2 text-sm font-bold">Total Gold Price</td>
//                       <td class="px-4 py-2 text-sm font-bold">₹${totalGoldPrice.toFixed(2)}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             `;
//           }
//         }

//         // Calculate Silver Price if provided
//         if (formData.silverType && formData.silverWeight) {
//           const silverWeight = parseFloat(formData.silverWeight);
//           let silverPricePerGram = formData.silverType === "silver-1" 
//             ? priceData.priceSilver1 
//             : priceData.priceSilver2;

//           const silverPriceForWeight = silverPricePerGram * silverWeight;
//           const wastageChargesSilver = silverPriceForWeight * (priceData.wastageChargesSilver / 100);
//           const makingChargesSilver = priceData.makingChargesSilver * silverWeight;
//           totalSilverPrice = silverPriceForWeight + wastageChargesSilver + makingChargesSilver;

//           resultText += `
//             <div class="overflow-x-auto">
//               <table class="min-w-full border-collapse border border-gray-400 mb-4">
//                 <thead class="bg-gray-200">
//                   <tr>
//                     <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase tracking-wider">Silver Details</th>
//                   </tr>
//                 </thead>
//                 <tbody class="bg-white">
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Type</td>
//                     <td class="px-4 py-2 text-sm">${formData.silverType}</td>
//                   </tr>
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Weight</td>
//                     <td class="px-4 py-2 text-sm">${silverWeight.toFixed(3)}g</td>
//                   </tr>
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Price per gram</td>
//                     <td class="px-4 py-2 text-sm">₹${silverPricePerGram.toFixed(2)}</td>
//                   </tr>
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Wastage Charges (${priceData.wastageChargesSilver}%)</td>
//                     <td class="px-4 py-2 text-sm">₹${wastageChargesSilver.toFixed(2)}</td>
//                   </tr>
//                   <tr class="border border-gray-400">
//                     <td class="px-4 py-2 text-sm">Making Charges (₹${priceData.makingChargesSilver}/g)</td>
//                     <td class="px-4 py-2 text-sm">₹${makingChargesSilver.toFixed(2)}</td>
//                   </tr>
//                   <tr class="bg-gray-100 border border-gray-400">
//                     <td class="px-4 py-2 text-sm font-bold">Total Silver Price</td>
//                     <td class="px-4 py-2 text-sm font-bold">₹${totalSilverPrice.toFixed(2)}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           `;
//         }

//         const grossTotal = (totalGoldPrice || 0) + (totalSilverPrice || 0);
//         resultText += `
//           <div class="overflow-x-auto">
//             <table class="min-w-full border-collapse border border-gray-400">
//               <tbody>
//                 <tr class="bg-gray-100 border border-gray-400">
//                   <td class="px-4 py-2 text-sm font-bold">Gross Total</td>
//                   <td class="px-4 py-2 text-sm font-bold">₹${grossTotal.toFixed(2)}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         `;

//         setResult(resultText);
//         setFormData({
//           goldType: "",
//           goldWeight: "",
//           silverType: "",
//           silverWeight: "",
//         });
//       }
//     } catch (error) {
//       console.error("Error calculating price:", error);
//       setResult("Error: Unable to calculate price");
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-8">
//       <PromotionNews />
//       {priceData && (
//         <div>
//           <h2 className="text-2xl font-bold mb-4">Today's Price Details /gram</h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {[
//               { label: "18K", value: priceData.price18Karat },
//               { label: "20K", value: priceData.price20Karat },
//               { label: "22K", value: priceData.price22Karat },
//               { label: "24K", value: priceData.price24Karat },
//               { label: "Silver 1", value: priceData.priceSilver1 },
//               { label: "Silver 2", value: priceData.priceSilver2 },
//             ].map((item, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 hover:bg-primary/5"
//               >
//                 <h3 className="text-sm font-semibold text-gray-600">{item.label}</h3>
//                 <p className="text-lg font-bold text-primary">₹{item.value?.toFixed(2)}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       <div className="space-y-4">
//         <h1 className="text-4xl font-bold">Welcome to Srinivasa Jewellers</h1>
//         <p className="text-lg text-gray-600">
//           Where elegance meets craftsmanship. Explore our exquisite collection of fine gold jewelry, 
//           from timeless classics to unique statement pieces.
//         </p>
//       </div>
//       <div className="bg-card rounded-lg p-6 shadow-md">
//         <h2 className="text-2xl font-bold mb-6">Gold and Silver Price Calculator</h2>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-4">
//             <Label>Gold Type</Label>
//             <RadioGroup
//               value={formData.goldType}
//               onValueChange={(value) => setFormData({ ...formData, goldType: value })}
//               className="flex flex-wrap gap-4"
//             >
//               {["18-Karat", "20-Karat", "22-Karat", "24-Karat"].map((type) => (
//                 <div key={type} className="flex items-center space-x-2">
//                   <RadioGroupItem value={type} id={type} />
//                   <Label htmlFor={type}>{type}</Label>
//                 </div>
//               ))}
//             </RadioGroup>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="goldWeight">Gold Weight (in grams)</Label>
//             <Input
//               id="goldWeight"
//               type="number"
//               step="0.001"
//               value={formData.goldWeight}
//               onChange={(e) => setFormData({ ...formData, goldWeight: e.target.value })}
//             />
//           </div>
//           <div className="space-y-4">
//             <Label>Silver Type</Label>
//             <RadioGroup
//               value={formData.silverType}
//               onValueChange={(value) => setFormData({ ...formData, silverType: value })}
//               className="flex flex-wrap gap-4"
//             >
//               {["silver-1", "silver-2"].map((type) => (
//                 <div key={type} className="flex items-center space-x-2">
//                   <RadioGroupItem value={type} id={type} />
//                   <Label htmlFor={type}>{type.replace("-", " ").toUpperCase()}</Label>
//                 </div>
//               ))}
//             </RadioGroup>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="silverWeight">Silver Weight (in grams)</Label>
//             <Input
//               id="silverWeight"
//               type="number"
//               step="0.001"
//               value={formData.silverWeight}
//               onChange={(e) => setFormData({ ...formData, silverWeight: e.target.value })}
//             />
//           </div>
//           <Button 
//             type="submit" 
//             className="inline-flex items-center px-6 transition-all duration-300 hover:scale-105"
//           >
//             Calculate Price
//           </Button>
//         </form>
//         {result && (
//           <div className="mt-6 p-4 bg-muted rounded-lg" dangerouslySetInnerHTML={{ __html: result }} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;



import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PromotionNews } from "@/components/promotions/PromotionNews";
import { toast } from "sonner";

const Home = () => {
  const [priceData, setPriceData] = useState<any>(null);
  const [result, setResult] = useState<string>("");
  const [formData, setFormData] = useState({
    goldType: "",
    goldWeight: "",
    silverType: "",
    silverWeight: "",
  });

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const docRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPriceData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
    };
    fetchPriceData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.goldType && !formData.silverType) {
      setResult("Please select a gold or silver type");
      return;
    }

    try {
      const docRef = doc(db, "priceData", "9wWClo0OSjIY6odJfvN4");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const priceData = docSnap.data();
        let resultText = "";
        let totalGoldPrice = 0;
        let totalSilverPrice = 0;

        // Calculate Gold Price if provided
        if (formData.goldType && formData.goldWeight) {
          const goldWeight = parseFloat(formData.goldWeight);
          let goldPricePerGram = 0;
          let applyWastageMakingCharges = true;

          switch (formData.goldType) {
            case "18-Karat":
              goldPricePerGram = priceData.price18Karat;
              break;
            case "20-Karat":
              goldPricePerGram = priceData.price20Karat;
              break;
            case "22-Karat":
              goldPricePerGram = priceData.price22Karat;
              break;
            case "24-Karat":
              goldPricePerGram = priceData.price24Karat;
              applyWastageMakingCharges = false;
              break;
          }

          const goldPriceForWeight = goldPricePerGram * goldWeight;
          if (applyWastageMakingCharges) {
            const wastageChargesGold = goldPriceForWeight * (priceData.goldwastageCharges / 100);
            const makingChargesGold = priceData.goldmakingCharges * goldWeight;
            totalGoldPrice = goldPriceForWeight + wastageChargesGold + makingChargesGold;

            resultText += `
              <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-400 mb-4">
                  <thead class="bg-gray-200">
                    <tr>
                      <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase tracking-wider">Gold Details</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white">
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Type</td>
                      <td class="px-4 py-2 text-sm">${formData.goldType}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Weight</td>
                      <td class="px-4 py-2 text-sm">${goldWeight.toFixed(3)}g</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Price per gram</td>
                      <td class="px-4 py-2 text-sm">₹${goldPricePerGram.toFixed(2)}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Wastage Charges (${priceData.goldwastageCharges}%)</td>
                      <td class="px-4 py-2 text-sm">₹${wastageChargesGold.toFixed(2)}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Making Charges (₹${priceData.goldmakingCharges}/g)</td>
                      <td class="px-4 py-2 text-sm">₹${makingChargesGold.toFixed(2)}</td>
                    </tr>
                    <tr class="bg-gray-100 border border-gray-400">
                      <td class="px-4 py-2 text-sm font-bold">Total Gold Price</td>
                      <td class="px-4 py-2 text-sm font-bold">₹${totalGoldPrice.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `;
          } else {
            totalGoldPrice = goldPriceForWeight;
            resultText += `
              <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-400 mb-4">
                  <thead class="bg-gray-200">
                    <tr>
                      <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase tracking-wider">Gold Details</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white">
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Type</td>
                      <td class="px-4 py-2 text-sm">${formData.goldType}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Weight</td>
                      <td class="px-4 py-2 text-sm">${goldWeight.toFixed(3)}g</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Price per gram</td>
                      <td class="px-4 py-2 text-sm">₹${goldPricePerGram.toFixed(2)}</td>
                    </tr>
                    <tr class="bg-gray-100 border border-gray-400">
                      <td class="px-4 py-2 text-sm font-bold">Total Gold Price</td>
                      <td class="px-4 py-2 text-sm font-bold">₹${totalGoldPrice.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `;
          }
        }

        // Calculate Silver Price if provided
        if (formData.silverType && formData.silverWeight) {
          const silverWeight = parseFloat(formData.silverWeight);
          let silverPricePerGram = formData.silverType === "silver-1" 
            ? priceData.priceSilver1 
            : priceData.priceSilver2;

          const silverPriceForWeight = silverPricePerGram * silverWeight;
          const wastageChargesSilver = silverPriceForWeight * (priceData.wastageChargesSilver / 100);
          const makingChargesSilver = priceData.makingChargesSilver * silverWeight;
          totalSilverPrice = silverPriceForWeight + wastageChargesSilver + makingChargesSilver;

          resultText += `
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse border border-gray-400 mb-4">
                <thead class="bg-gray-200">
                  <tr>
                    <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase tracking-wider">Silver Details</th>
                  </tr>
                </thead>
                <tbody class="bg-white">
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Type</td>
                    <td class="px-4 py-2 text-sm">${formData.silverType}</td>
                  </tr>
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Weight</td>
                    <td class="px-4 py-2 text-sm">${silverWeight.toFixed(3)}g</td>
                  </tr>
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Price per gram</td>
                    <td class="px-4 py-2 text-sm">₹${silverPricePerGram.toFixed(2)}</td>
                  </tr>
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Wastage Charges (${priceData.wastageChargesSilver}%)</td>
                    <td class="px-4 py-2 text-sm">₹${wastageChargesSilver.toFixed(2)}</td>
                  </tr>
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Making Charges (₹${priceData.makingChargesSilver}/g)</td>
                    <td class="px-4 py-2 text-sm">₹${makingChargesSilver.toFixed(2)}</td>
                  </tr>
                  <tr class="bg-gray-100 border border-gray-400">
                    <td class="px-4 py-2 text-sm font-bold">Total Silver Price</td>
                    <td class="px-4 py-2 text-sm font-bold">₹${totalSilverPrice.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `;
        }

        const grossTotal = (totalGoldPrice || 0) + (totalSilverPrice || 0);
        resultText += `
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse border border-gray-400">
              <tbody>
                <tr class="bg-gray-100 border border-gray-400">
                  <td class="px-4 py-2 text-sm font-bold">Gross Total</td>
                  <td class="px-4 py-2 text-sm font-bold">₹${grossTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;

        setResult(resultText);
        setFormData({
          goldType: "",
          goldWeight: "",
          silverType: "",
          silverWeight: "",
        });
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      setResult("Error: Unable to calculate price");
    }
  };

  return (
    <div className="max-w-full mx-auto space-y-8 bg-white shadow-xl rounded-xl p-10 backdrop-blur-sm">
      
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold text-gray-900">Welcome to Srinivasa Jewellers</h1>
        <p className="text-lg text-gray-600">
          Where elegance meets craftsmanship. Explore our exquisite collection of fine gold jewellery, 
          from timeless classics to unique statement pieces.
        </p>
      </div>
      
      <PromotionNews />
      {priceData && (
        <div>
          <h2 className="text-3xl font-bold mb-6">Today's Price Details /gram</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {[{ label: "18K", value: priceData.price18Karat }, { label: "20K", value: priceData.price20Karat }, { label: "22K", value: priceData.price22Karat }, { label: "24K", value: priceData.price24Karat }, { label: "Silver 1", value: priceData.priceSilver1 }, { label: "Silver 2", value: priceData.priceSilver2 }].map((item, index) => (
              <div
                key={index}
                className="bg-transparent p-2 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-transform"
              >
                <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>
                <p className="text-2xl font-bold text-primary">₹{item.value?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-card p-8 shadow-2xl backdrop-blur-md rounded-xl">
        <h2 className="text-3xl font-semibold mb-4">Gold and Silver Price Calculator</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg">Gold Purity</Label>
            <RadioGroup
              value={formData.goldType}
              onValueChange={(value) => setFormData({ ...formData, goldType: value })}
              className="flex flex-wrap gap-6"
            >
              {["18-Karat", "20-Karat", "22-Karat", "24-Karat"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type}>{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goldWeight" className="text-lg">Gold Weight (in grams)</Label>
            <Input
              id="goldWeight"
              type="number"
              step="0.001"
              value={formData.goldWeight}
              onChange={(e) => setFormData({ ...formData, goldWeight: e.target.value })}
              className="bg-transparent border-2 border-gray-400 rounded-xl p-3 w-full focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-4">
            <Label className="text-lg">Silver Purity</Label>
            <RadioGroup
              value={formData.silverType}
              onValueChange={(value) => setFormData({ ...formData, silverType: value })}
              className="flex flex-wrap gap-6"
            >
              {["silver-1", "silver-2"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type}>{type.replace("-", " ").toUpperCase()}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="silverWeight" className="text-lg">Silver Weight (in grams)</Label>
            <Input
              id="silverWeight"
              type="number"
              step="0.001"
              value={formData.silverWeight}
              onChange={(e) => setFormData({ ...formData, silverWeight: e.target.value })}
              className="bg-transparent border-2 border-gray-400 rounded-xl p-3 w-full focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button
            type="submit"
            className="inline-flex items-center px-6 transition-all duration-300 hover:scale-105 bg-primary rounded-xl text-white py-3"
          >
            Calculate Price
          </Button>
        </form>
        {result && (
          <div className="mt-6 p-4 bg-muted rounded-lg" dangerouslySetInnerHTML={{ __html: result }} />
        )}
      </div>
    </div>
  );
};

export default Home;
