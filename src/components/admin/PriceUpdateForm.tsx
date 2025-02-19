// import { useState, useEffect } from "react";
// import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { AlertCircle } from "lucide-react";

// // Constants for materials and purity
// const MATERIALS = ['Gold', 'Silver'] as const;
// const PURITY_OPTIONS = {
//   'Gold': ['18 Karat', '20 Karat', '22 Karat', '24 Karat'],
//   'Silver': ['Silver 999', 'Silver 925']
// } as const;

// interface PriceFormData {
//   // Gold prices
//   price24Karat: number;
//   price22Karat: number;
//   price20Karat: number;
//   price18Karat: number;
//   // Silver prices
//   priceSilver999: number;
//   priceSilver925: number;
//   // Making and wastage charges
//   goldwastageCharges: number;
//   goldmakingCharges: number;
//   wastageChargesSilver: number;
//   makingChargesSilver: number;
// }

// interface FormState {
//   price24Karat: string;
//   price22Karat: string;
//   price20Karat: string;
//   price18Karat: string;
//   priceSilver999: string;
//   priceSilver925: string;
//   goldwastageCharges: string;
//   goldmakingCharges: string;
//   wastageChargesSilver: string;
//   makingChargesSilver: string;
// }

// const PriceUpdateForm = () => {
//   const [formData, setFormData] = useState<FormState>({
//     price18Karat: "",
//     price20Karat: "",
//     price22Karat: "",
//     price24Karat: "",
//     priceSilver999: "",
//     priceSilver925: "",
//     goldwastageCharges: "",
//     goldmakingCharges: "",
//     wastageChargesSilver: "",
//     makingChargesSilver: "",
//   });

//   const [previousPrices, setPreviousPrices] = useState<any>(null);
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Fetch previous prices on mount
//   useEffect(() => {
//     const fetchPreviousPrices = async () => {
//       try {
//         const docRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           // Map old field names to new ones if they exist
//           setPreviousPrices({
//             ...data,
//             priceSilver999: data.priceSilver999 || data.priceSilver1,
//             priceSilver925: data.priceSilver925 || data.priceSilver2
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching previous prices:", error);
//       }
//     };
//     fetchPreviousPrices();
//   }, []);

//   const validatePrices = () => {
//     const errors: string[] = [];
//     const numericData: PriceFormData = {
//       price24Karat: parseFloat(formData.price24Karat) || 0,
//       price22Karat: parseFloat(formData.price22Karat) || 0,
//       price20Karat: parseFloat(formData.price20Karat) || 0,
//       price18Karat: parseFloat(formData.price18Karat) || 0,
//       priceSilver999: parseFloat(formData.priceSilver999) || 0,
//       priceSilver925: parseFloat(formData.priceSilver925) || 0,
//       goldwastageCharges: parseFloat(formData.goldwastageCharges) || 0,
//       goldmakingCharges: parseFloat(formData.goldmakingCharges) || 0,
//       wastageChargesSilver: parseFloat(formData.wastageChargesSilver) || 0,
//       makingChargesSilver: parseFloat(formData.makingChargesSilver) || 0,
//     };

//     // Validate gold prices (reasonable range check)
//     if (numericData.price24Karat > 0) {
//       if (numericData.price22Karat >= numericData.price24Karat) {
//         errors.push("22 Karat gold price should be less than 24 Karat price");
//       }
//       if (numericData.price20Karat >= numericData.price22Karat) {
//         errors.push("20 Karat gold price should be less than 22 Karat price");
//       }
//       if (numericData.price18Karat >= numericData.price20Karat) {
//         errors.push("18 Karat gold price should be less than 20 Karat price");
//       }
//     }

//     // Validate silver prices
//     if (numericData.priceSilver999 > 0 && numericData.priceSilver925 >= numericData.priceSilver999) {
//       errors.push("Silver 925 price should be less than Silver 999 price");
//     }

//     // Validate charges (percentage and reasonable range)
//     if (numericData.goldwastageCharges > 15) {
//       errors.push("Gold wastage charges seem unusually high (>15%)");
//     }
//     if (numericData.wastageChargesSilver > 15) {
//       errors.push("Silver wastage charges seem unusually high (>15%)");
//     }

//     return errors;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const errors = validatePrices();
    
//     if (errors.length > 0) {
//       errors.forEach(error => toast.error(error));
//       return;
//     }

//     setShowConfirmDialog(true);
//   };

//   const confirmUpdate = async () => {
//     setIsLoading(true);
//     try {
//       const numericData: PriceFormData = {
//         price24Karat: parseFloat(formData.price24Karat) || 0,
//         price22Karat: parseFloat(formData.price22Karat) || 0,
//         price20Karat: parseFloat(formData.price20Karat) || 0,
//         price18Karat: parseFloat(formData.price18Karat) || 0,
//         priceSilver999: parseFloat(formData.priceSilver999) || 0,
//         priceSilver925: parseFloat(formData.priceSilver925) || 0,
//         goldwastageCharges: parseFloat(formData.goldwastageCharges) || 0,
//         goldmakingCharges: parseFloat(formData.goldmakingCharges) || 0,
//         wastageChargesSilver: parseFloat(formData.wastageChargesSilver) || 0,
//         makingChargesSilver: parseFloat(formData.makingChargesSilver) || 0,
//       };

//       // Save data with new field names while maintaining backward compatibility
//       const dataToSave = {
//         ...numericData,
//         // Keep old field names for backward compatibility
//         priceSilver1: numericData.priceSilver999,
//         priceSilver2: numericData.priceSilver925,
//         timestamp: serverTimestamp()
//       };

//       await setDoc(doc(db, "priceData", "4OhZCKHQls64bokVqGN5"), dataToSave);
      
//       toast.success("Price details updated successfully!");
//       setPreviousPrices({ ...numericData, timestamp: new Date() });
      
//       // Reset form after successful submission
//       setFormData({
//         price18Karat: "",
//         price20Karat: "",
//         price22Karat: "",
//         price24Karat: "",
//         priceSilver999: "",
//         priceSilver925: "",
//         goldwastageCharges: "",
//         goldmakingCharges: "",
//         wastageChargesSilver: "",
//         makingChargesSilver: "",
//       });
//     } catch (error) {
//       console.error("Error saving price details:", error);
//       toast.error("Error saving price details");
//     } finally {
//       setIsLoading(false);
//       setShowConfirmDialog(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.id]: e.target.value,
//     });
//   };

//   const calculatePrice = (karat: number) => {
//     if (!formData.price24Karat) return "";
//     const price24K = parseFloat(formData.price24Karat);
//     if (isNaN(price24K)) return "";
//     return ((price24K * karat) / 24).toFixed(2);
//   };

//   return (
//     <div className="bg-card rounded-lg p-6 shadow-md">
//       <h2 className="text-2xl font-bold mb-6">Update Gold and Silver Prices</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Gold Prices */}
//           <div className="space-y-2">
//             <Label htmlFor="price24Karat">24 Karat Gold Price (per gram)</Label>
//             <Input
//               type="number"
//               id="price24Karat"
//               value={formData.price24Karat}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               placeholder={previousPrices?.price24Karat?.toFixed(2) || ""}
//             />
//             {previousPrices?.price24Karat && (
//               <p className="text-sm text-gray-500">Previous: ₹{previousPrices.price24Karat.toFixed(2)}</p>
//             )}
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="price22Karat">22 Karat Gold Price (per gram)</Label>
//             <Input
//               type="number"
//               id="price22Karat"
//               value={formData.price22Karat}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               placeholder={previousPrices?.price22Karat?.toFixed(2) || calculatePrice(22)}
//             />
//             {previousPrices?.price22Karat && (
//               <p className="text-sm text-gray-500">Previous: ₹{previousPrices.price22Karat.toFixed(2)}</p>
//             )}
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="price20Karat">20 Karat Gold Price (per gram)</Label>
//             <Input
//               type="number"
//               id="price20Karat"
//               value={formData.price20Karat}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               placeholder={previousPrices?.price20Karat?.toFixed(2) || calculatePrice(20)}
//             />
//             {previousPrices?.price20Karat && (
//               <p className="text-sm text-gray-500">Previous: ₹{previousPrices.price20Karat.toFixed(2)}</p>
//             )}
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="price18Karat">18 Karat Gold Price (per gram)</Label>
//             <Input
//               type="number"
//               id="price18Karat"
//               value={formData.price18Karat}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               placeholder={previousPrices?.price18Karat?.toFixed(2) || calculatePrice(18)}
//             />
//             {previousPrices?.price18Karat && (
//               <p className="text-sm text-gray-500">Previous: ₹{previousPrices.price18Karat.toFixed(2)}</p>
//             )}
//           </div>

//           {/* Silver Prices */}
//           <div className="space-y-2">
//             <Label htmlFor="priceSilver999">Silver 999 Price (per gram)</Label>
//             <Input
//               type="number"
//               id="priceSilver999"
//               value={formData.priceSilver999}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               placeholder={previousPrices?.priceSilver999?.toFixed(2) || ""}
//             />
//             {previousPrices?.priceSilver999 && (
//               <p className="text-sm text-gray-500">Previous: ₹{previousPrices.priceSilver999.toFixed(2)}</p>
//             )}
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="priceSilver925">Silver 925 Price (per gram)</Label>
//             <Input
//               type="number"
//               id="priceSilver925"
//               value={formData.priceSilver925}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               placeholder={previousPrices?.priceSilver925?.toFixed(2) || ""}
//             />
//             {previousPrices?.priceSilver925 && (
//               <p className="text-sm text-gray-500">Previous: ₹{previousPrices.priceSilver925.toFixed(2)}</p>
//             )}
//           </div>

//           {/* Charges */}
//           <div className="space-y-2">
//             <Label htmlFor="goldwastageCharges">Gold Wastage Charges (%)</Label>
//             <Input
//               type="number"
//               id="goldwastageCharges"
//               value={formData.goldwastageCharges}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               max="15"
//               placeholder={previousPrices?.goldwastageCharges?.toString() || ""}
//             />
//             {previousPrices?.goldwastageCharges && (
//               <p className="text-sm text-gray-500">Previous: {previousPrices.goldwastageCharges}%</p>
//             )}
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="goldmakingCharges">Gold Making Charges (per gram)</Label>
//             <Input
//               type="number"
//               id="goldmakingCharges"
//               value={formData.goldmakingCharges}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               placeholder={previousPrices?.goldmakingCharges?.toFixed(2) || ""}
//             />
//             {previousPrices?.goldmakingCharges && (
//               <p className="text-sm text-gray-500">Previous: ₹{previousPrices.goldmakingCharges.toFixed(2)}</p>
//             )}
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="wastageChargesSilver">Silver Wastage Charges (%)</Label>
//             <Input
//               type="number"
//               id="wastageChargesSilver"
//               value={formData.wastageChargesSilver}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               max="15"
//               placeholder={previousPrices?.wastageChargesSilver?.toString() || ""}
//             />
//             {previousPrices?.wastageChargesSilver && (
//               <p className="text-sm text-gray-500">Previous: {previousPrices.wastageChargesSilver}%</p>
//             )}
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="makingChargesSilver">Silver Making Charges (per gram)</Label>
//             <Input
//               type="number"
//               id="makingChargesSilver"
//               value={formData.makingChargesSilver}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               placeholder={previousPrices?.makingChargesSilver?.toFixed(2) || ""}
//             />
//             {previousPrices?.makingChargesSilver && (
//               <p className="text-sm text-gray-500">Previous: ₹{previousPrices.makingChargesSilver.toFixed(2)}</p>
//             )}
//           </div>
//         </div>

//         <Button type="submit" className="w-full" disabled={isLoading}>
//           {isLoading ? "Updating..." : "Update Prices"}
//         </Button>
//       </form>

//       <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Price Update</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to update the prices? This will affect all product calculations.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="flex items-start space-x-2">
//               <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
//               <p className="text-sm text-gray-500">
//                 Please verify the new prices carefully. This action will immediately affect all product prices on the website.
//               </p>
//             </div>
//             {/* Show significant changes */}
//             {previousPrices && (
//               <div className="space-y-2">
//                 <h4 className="text-sm font-medium">Significant Changes:</h4>
//                 <ul className="text-sm space-y-1">
//                   {Object.entries(formData).map(([key, value]) => {
//                     const newValue = parseFloat(value);
//                     const oldValue = previousPrices[key];
//                     if (newValue && oldValue) {
//                       const percentChange = ((newValue - oldValue) / oldValue) * 100;
//                       if (Math.abs(percentChange) > 5) {
//                         return (
//                           <li key={key} className={percentChange > 0 ? "text-green-600" : "text-red-600"}>
//                             {key}: {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}% change
//                           </li>
//                         );
//                       }
//                     }
//                     return null;
//                   })}
//                 </ul>
//               </div>
//             )}
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
//               Cancel
//             </Button>
//             <Button onClick={confirmUpdate} disabled={isLoading}>
//               {isLoading ? "Updating..." : "Confirm Update"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default PriceUpdateForm;


import { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

// Constants for materials and purity
const MATERIALS = ['Gold', 'Silver'] as const;
const PURITY_OPTIONS = {
  'Gold': ['18 Karat', '20 Karat', '22 Karat', '24 Karat'],
  'Silver': ['Silver 999', 'Silver 925']
} as const;

interface PriceFormData {
  // Gold prices
  price24Karat: number;
  price22Karat: number;
  price20Karat: number;
  price18Karat: number;
  // Silver prices
  priceSilver999: number;
  priceSilver925: number;
  // Making and wastage charges
  goldwastageCharges: number;
  goldmakingCharges: number;
  wastageChargesSilver: number;
  makingChargesSilver: number;
}

interface FormState {
  price24Karat: string;
  price22Karat: string;
  price20Karat: string;
  price18Karat: string;
  priceSilver999: string;
  priceSilver925: string;
  goldwastageCharges: string;
  goldmakingCharges: string;
  wastageChargesSilver: string;
  makingChargesSilver: string;
}

const PriceUpdateForm = () => {
  const [formData, setFormData] = useState<FormState>({
    price18Karat: "",
    price20Karat: "",
    price22Karat: "",
    price24Karat: "",
    priceSilver999: "",
    priceSilver925: "",
    goldwastageCharges: "",
    goldmakingCharges: "",
    wastageChargesSilver: "",
    makingChargesSilver: "",
  });

  const [previousPrices, setPreviousPrices] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch previous prices on mount
  useEffect(() => {
    const fetchPreviousPrices = async () => {
      try {
        const docRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Map old field names to new ones if they exist
          setPreviousPrices({
            ...data,
            priceSilver999: data.priceSilver999 || data.priceSilver1,
            priceSilver925: data.priceSilver925 || data.priceSilver2
          });
        }
      } catch (error) {
        console.error("Error fetching previous prices:", error);
      }
    };
    fetchPreviousPrices();
  }, []);

  const validatePrices = () => {
    const errors: string[] = [];
    const numericData: PriceFormData = {
      price24Karat: parseFloat(formData.price24Karat) || 0,
      price22Karat: parseFloat(formData.price22Karat) || 0,
      price20Karat: parseFloat(formData.price20Karat) || 0,
      price18Karat: parseFloat(formData.price18Karat) || 0,
      priceSilver999: parseFloat(formData.priceSilver999) || 0,
      priceSilver925: parseFloat(formData.priceSilver925) || 0,
      goldwastageCharges: parseFloat(formData.goldwastageCharges) || 0,
      goldmakingCharges: parseFloat(formData.goldmakingCharges) || 0,
      wastageChargesSilver: parseFloat(formData.wastageChargesSilver) || 0,
      makingChargesSilver: parseFloat(formData.makingChargesSilver) || 0,
    };

    // Validate gold prices (reasonable range check)
    if (numericData.price24Karat > 0) {
      if (numericData.price22Karat >= numericData.price24Karat) {
        errors.push("22 Karat gold price should be less than 24 Karat price");
      }
      if (numericData.price20Karat >= numericData.price22Karat) {
        errors.push("20 Karat gold price should be less than 22 Karat price");
      }
      if (numericData.price18Karat >= numericData.price20Karat) {
        errors.push("18 Karat gold price should be less than 20 Karat price");
      }
    }

    // Validate silver prices
    if (numericData.priceSilver999 > 0 && numericData.priceSilver925 >= numericData.priceSilver999) {
      errors.push("Silver 925 price should be less than Silver 999 price");
    }

    // Validate charges (percentage and reasonable range)
    if (numericData.goldwastageCharges > 15) {
      errors.push("Gold wastage charges seem unusually high (>15%)");
    }
    if (numericData.wastageChargesSilver > 15) {
      errors.push("Silver wastage charges seem unusually high (>15%)");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePrices();
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmUpdate = async () => {
    setIsLoading(true);
    try {
      const numericData: PriceFormData = {
        price24Karat: parseFloat(formData.price24Karat) || 0,
        price22Karat: parseFloat(formData.price22Karat) || 0,
        price20Karat: parseFloat(formData.price20Karat) || 0,
        price18Karat: parseFloat(formData.price18Karat) || 0,
        priceSilver999: parseFloat(formData.priceSilver999) || 0,
        priceSilver925: parseFloat(formData.priceSilver925) || 0,
        goldwastageCharges: parseFloat(formData.goldwastageCharges) || 0,
        goldmakingCharges: parseFloat(formData.goldmakingCharges) || 0,
        wastageChargesSilver: parseFloat(formData.wastageChargesSilver) || 0,
        makingChargesSilver: parseFloat(formData.makingChargesSilver) || 0,
      };

      // Save data with new field names while maintaining backward compatibility
      const dataToSave = {
        ...numericData,
        // Keep old field names for backward compatibility
        priceSilver1: numericData.priceSilver999,
        priceSilver2: numericData.priceSilver925,
        timestamp: serverTimestamp()
      };

      await setDoc(doc(db, "priceData", "4OhZCKHQls64bokVqGN5"), dataToSave);
      
      toast.success("Price details updated successfully!");
      setPreviousPrices({ ...numericData, timestamp: new Date() });
      
      // Reset form after successful submission
      setFormData({
        price18Karat: "",
        price20Karat: "",
        price22Karat: "",
        price24Karat: "",
        priceSilver999: "",
        priceSilver925: "",
        goldwastageCharges: "",
        goldmakingCharges: "",
        wastageChargesSilver: "",
        makingChargesSilver: "",
      });
    } catch (error) {
      console.error("Error saving price details:", error);
      toast.error("Error saving price details");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const calculatePrice = (karat: number) => {
    if (!formData.price24Karat) return "";
    const price24K = parseFloat(formData.price24Karat);
    if (isNaN(price24K)) return "";
    return ((price24K * karat) / 24).toFixed(2);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6">Update Gold and Silver Prices</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gold Prices */}
          <div className="space-y-2">
            <Label htmlFor="price24Karat">24 Karat Gold Price (per gram)</Label>
            <Input
              type="number"
              id="price24Karat"
              value={formData.price24Karat}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder={previousPrices?.price24Karat?.toFixed(2) || ""}
            />
            {previousPrices?.price24Karat && (
              <p className="text-sm text-gray-500">Previous: ₹{previousPrices.price24Karat.toFixed(2)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price22Karat">22 Karat Gold Price (per gram)</Label>
            <Input
              type="number"
              id="price22Karat"
              value={formData.price22Karat}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder={previousPrices?.price22Karat?.toFixed(2) || calculatePrice(22)}
            />
            {previousPrices?.price22Karat && (
              <p className="text-sm text-gray-500">Previous: ₹{previousPrices.price22Karat.toFixed(2)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price20Karat">20 Karat Gold Price (per gram)</Label>
            <Input
              type="number"
              id="price20Karat"
              value={formData.price20Karat}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder={previousPrices?.price20Karat?.toFixed(2) || calculatePrice(20)}
            />
            {previousPrices?.price20Karat && (
              <p className="text-sm text-gray-500">Previous: ₹{previousPrices.price20Karat.toFixed(2)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price18Karat">18 Karat Gold Price (per gram)</Label>
            <Input
              type="number"
              id="price18Karat"
              value={formData.price18Karat}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder={previousPrices?.price18Karat?.toFixed(2) || calculatePrice(18)}
            />
            {previousPrices?.price18Karat && (
              <p className="text-sm text-gray-500">Previous: ₹{previousPrices.price18Karat.toFixed(2)}</p>
            )}
          </div>

          {/* Silver Prices */}
          <div className="space-y-2">
            <Label htmlFor="priceSilver999">Silver 999 Price (per gram)</Label>
            <Input
              type="number"
              id="priceSilver999"
              value={formData.priceSilver999}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder={previousPrices?.priceSilver999?.toFixed(2) || ""}
            />
            {previousPrices?.priceSilver999 && (
              <p className="text-sm text-gray-500">Previous: ₹{previousPrices.priceSilver999.toFixed(2)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceSilver925">Silver 925 Price (per gram)</Label>
            <Input
              type="number"
              id="priceSilver925"
              value={formData.priceSilver925}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder={previousPrices?.priceSilver925?.toFixed(2) || ""}
            />
            {previousPrices?.priceSilver925 && (
              <p className="text-sm text-gray-500">Previous: ₹{previousPrices.priceSilver925.toFixed(2)}</p>
            )}
          </div>

          {/* Charges */}
          <div className="space-y-2">
            <Label htmlFor="goldwastageCharges">Gold Wastage Charges (%)</Label>
            <Input
              type="number"
              id="goldwastageCharges"
              value={formData.goldwastageCharges}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              max="15"
              placeholder={previousPrices?.goldwastageCharges?.toString() || ""}
            />
            {previousPrices?.goldwastageCharges && (
              <p className="text-sm text-gray-500">Previous: {previousPrices.goldwastageCharges}%</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="goldmakingCharges">Gold Making Charges (per gram)</Label>
            <Input
              type="number"
              id="goldmakingCharges"
              value={formData.goldmakingCharges}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder={previousPrices?.goldmakingCharges?.toFixed(2) || ""}
            />
            {previousPrices?.goldmakingCharges && (
              <p className="text-sm text-gray-500">Previous: ₹{previousPrices.goldmakingCharges.toFixed(2)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="wastageChargesSilver">Silver Wastage Charges (%)</Label>
            <Input
              type="number"
              id="wastageChargesSilver"
              value={formData.wastageChargesSilver}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              max="15"
              placeholder={previousPrices?.wastageChargesSilver?.toString() || ""}
            />
            {previousPrices?.wastageChargesSilver && (
              <p className="text-sm text-gray-500">Previous: {previousPrices.wastageChargesSilver}%</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="makingChargesSilver">Silver Making Charges (per gram)</Label>
            <Input
              type="number"
              id="makingChargesSilver"
              value={formData.makingChargesSilver}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder={previousPrices?.makingChargesSilver?.toFixed(2) || ""}
            />
            {previousPrices?.makingChargesSilver && (
              <p className="text-sm text-gray-500">Previous: ₹{previousPrices.makingChargesSilver.toFixed(2)}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Prices"}
        </Button>
      </form>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Price Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the prices? This will affect all product calculations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <p className="text-sm text-gray-500">
                Please verify the new prices carefully. This action will immediately affect all product prices on the website.
              </p>
            </div>
            {/* Show significant changes */}
            {previousPrices && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Significant Changes:</h4>
                <ul className="text-sm space-y-1">
                  {Object.entries(formData).map(([key, value]) => {
                    const newValue = value;
                    const oldValue = previousPrices[key];
                    if (newValue && oldValue) {
                      const percentChange = ((newValue - oldValue) / oldValue) * 100;
                      if (Math.abs(percentChange) > 5) {
                        return (
                          <li key={key} className={percentChange > 0 ? "text-green-600" : "text-red-600"}>
                            {key}: {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}% change
                          </li>
                        );
                      }
                    }
                    return null;
                  })}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpdate} disabled={isLoading}>
              {isLoading ? "Updating..." : "Confirm Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriceUpdateForm;
