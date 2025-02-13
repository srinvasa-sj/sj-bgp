//------- correct working code---------------//
// import { useEffect, useState } from "react";
// import { getDoc, doc, collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
// import ProductCard from "@/components/products/ProductCard";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";

// interface Product {
//   name: string;
//   productCategory: string;
//   material?: string;
//   purity?: string;
//   weight: number;
//   imageUrl: string;
//   imageUrls?: string[];
//   productID?: string;
//   timestamp?: {
//     seconds: number;
//     nanoseconds: number;
//   };
// }

// interface Promotion {
//   promotionName: string;
//   startDate: string;
//   endDate: string;
//   giftDescription: string;
//   priceDiscount: number;
//   wastageDiscount: number;
//   makingChargesDiscount: number;
//   productName: string;
// }

// const Products = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [wishlist, setWishlist] = useState<Product[]>([]);
//   const [showWishlist, setShowWishlist] = useState(false);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [promotions, setPromotions] = useState<Promotion[]>([]);
//   const navigate = useNavigate();

//   // Advanced filtering states
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
//   const [selectedPurity, setSelectedPurity] = useState<string>("all");
//   const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

//   const categories = [
//     "Earrings",
//     "Necklaces",
//     "Rings",
//     "Bracelets",
//     "Bangles",
//     "Anklets",
//     "Men's Jewellery",
//     "Kid's Jewellery"
//   ];
  
//   const materials = ["Gold", "Silver"];
//   const purities = {
//     Gold: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
//     Silver: ["Fine Silver-99.9%", "Sterling Silver-92.5%"]
//   };

//   useEffect(() => {
//     const fetchPromotions = async () => {
//       try {
//         const promotionsCollection = collection(db, "promotions");
//         const promotionsSnapshot = await getDocs(promotionsCollection);
//         const currentDate = new Date();
        
//         const activePromotions = promotionsSnapshot.docs
//           .map(doc => ({ ...doc.data() } as Promotion))
//           .filter(promo => {
//             const startDate = new Date(promo.startDate);
//             const endDate = new Date(promo.endDate);
//             return currentDate >= startDate && currentDate <= endDate;
//           });
        
//         setPromotions(activePromotions);
//       } catch (error) {
//         console.error("Error fetching promotions:", error);
//       }
//     };

//     const fetchProducts = async () => {
//       try {
//         const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
//         const docSnap = await getDoc(docRef);
//         console.log("Fetching products...");

//         if (docSnap.exists() && docSnap.data().products) {
//           const productsData = docSnap.data().products;
//           const sortedProducts = productsData.sort((a: Product, b: Product) => {
//             const dateA = a.timestamp ? new Date(a.timestamp.seconds * 1000) : new Date(0);
//             const dateB = b.timestamp ? new Date(b.timestamp.seconds * 1000) : new Date(0);
//             return dateB.getTime() - dateA.getTime();
//           });
//           setProducts(sortedProducts);
//           setFilteredProducts(sortedProducts);
//           console.log("Products fetched and sorted:", sortedProducts);
//         } else {
//           console.log("No products found");
//           toast.error("No products available");
//         }
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//         toast.error("Error loading products");
//         setIsLoading(false);
//       }
//     };

//     const savedWishlist = localStorage.getItem('wishlist');
//     if (savedWishlist) {
//       setWishlist(JSON.parse(savedWishlist));
//     }

//     fetchProducts();
//     fetchPromotions();
//   }, []);

//   useEffect(() => {
//     let filtered = [...products];

//     // Apply category filter
//     if (selectedCategory && selectedCategory !== "all") {
//       filtered = filtered.filter(product => 
//         product.productCategory === selectedCategory
//       );
//     }

//     // Apply material filter
//     if (selectedMaterial && selectedMaterial !== "all") {
//       filtered = filtered.filter(product => 
//         product.material === selectedMaterial
//       );
//     }

//     // Apply purity filter
//     if (selectedPurity && selectedPurity !== "all") {
//       filtered = filtered.filter(product => 
//         product.purity === selectedPurity
//       );
//     }

//     // Apply price range filter
//     filtered = filtered.filter(product => {
//       // Implement price calculation logic here when ready
//       return true;
//     });

//     setFilteredProducts(filtered);
//   }, [selectedCategory, selectedMaterial, selectedPurity, priceRange, products]);

//   const handleAddToWishlist = (product: Product) => {
//     setWishlist(prev => {
//       const isInWishlist = prev.some(item => item.name === product.name);
//       let newWishlist: Product[];
      
//       if (isInWishlist) {
//         newWishlist = prev.filter(item => item.name !== product.name);
//         toast.success("Removed from wishlist");
//       } else {
//         newWishlist = [...prev, product];
//         toast.success("Added to wishlist");
//       }
      
//       localStorage.setItem('wishlist', JSON.stringify(newWishlist));
//       return newWishlist;
//     });
//   };

//   const handleCategoryClick = (category: string) => {
//     setSelectedCategory(category);
//     navigate(`/products?category=${category}`);
//   };

//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-4">
//         <h1 className="text-4xl font-bold mb-8">Our Products</h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[1, 2, 3].map((i) => (
//             <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   const displayProducts = showWishlist ? wishlist : filteredProducts;

//   return (
//     <div className="container mx-auto px-4">
//       <div className="overflow-x-auto mb-8">
//         <div className="flex space-x-4 py-4 px-2">
//           {categories.map((category) => (
//             <button
//               key={category}
//               onClick={() => handleCategoryClick(category)}
//               className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
//                 selectedCategory === category
//                 ? "bg-primary text-white"
//                 : "bg-secondary hover:bg-primary/10"
//               }`}
//             >
//               {category}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-4xl font-bold">
//           {showWishlist ? "My Wishlist" : "Our Products"}
//         </h1>
//         <button
//           onClick={() => setShowWishlist(!showWishlist)}
//           className="text-primary hover:text-primary/80 font-semibold"
//         >
//           {showWishlist ? "Show All Products" : "Show Wishlist"}
//         </button>
//       </div>

//       {!showWishlist && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Category</label>
//             <Select
//               value={selectedCategory}
//               onValueChange={setSelectedCategory}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select category" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Categories</SelectItem>
//                 {categories.map((category) => (
//                   <SelectItem key={category} value={category}>
//                     {category}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Material</label>
//             <Select
//               value={selectedMaterial}
//               onValueChange={setSelectedMaterial}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select material" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Materials</SelectItem>
//                 {materials.map((material) => (
//                   <SelectItem key={material} value={material}>
//                     {material}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Purity</label>
//             <Select
//               value={selectedPurity}
//               onValueChange={setSelectedPurity}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select purity" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Purities</SelectItem>
//                 {selectedMaterial && purities[selectedMaterial as keyof typeof purities]?.map((purity) => (
//                   <SelectItem key={purity} value={purity}>
//                     {purity}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Price Range</label>
//             <Slider
//               defaultValue={[0, 1000000]}
//               max={1000000}
//               step={1000}
//               onValueChange={(value) => setPriceRange(value as [number, number])}
//               className="mt-6"
//             />
//             <div className="flex justify-between text-sm text-gray-500">
//               <span>₹{priceRange[0].toLocaleString()}</span>
//               <span>₹{priceRange[1].toLocaleString()}</span>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {displayProducts.length === 0 ? (
//           <p className="col-span-full text-center text-gray-500 mt-8">
//             {showWishlist ? "Your wishlist is empty" : "No products found matching your filters"}
//           </p>
//         ) : (
//           displayProducts.map((product) => (
//             <ProductCard
//               key={product.name}
//               product={product}
//               onAddToWishlist={handleAddToWishlist}
//               isInWishlist={wishlist.some(item => item.name === product.name)}
//               activePromotion={promotions.find(promo => promo.productName === product.name)}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Products;







// import { useEffect, useState } from "react";
// import { getDoc, doc, collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
// import ProductCard from "@/components/products/ProductCard";
// import { useSearchParams } from "react-router-dom";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";

// interface Product {
//   name: string;
//   productCategory: string;
//   material?: string;
//   purity?: string;
//   weight: number;
//   imageUrl: string;
//   imageUrls?: string[];
//   productID?: string;
//   timestamp?: {
//     seconds: number;
//     nanoseconds: number;
//   };
// }

// interface Promotion {
//   promotionName: string;
//   giftDescription: string;
//   priceDiscount: number;
//   wastageDiscount: number;
//   makingChargesDiscount: number;
//   startDate: string;
//   endDate: string;
//   productName: string;
// }

// const Products = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [wishlist, setWishlist] = useState<Product[]>([]);
//   const [showWishlist, setShowWishlist] = useState(false);
//   const [searchParams] = useSearchParams();
//   const [promotions, setPromotions] = useState<{ [key: string]: Promotion }>({});
//   const [priceRanges, setPriceRanges] = useState<{ [key: string]: number }>({});

//   // Advanced filtering states
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
//   const [selectedPurity, setSelectedPurity] = useState<string>("all");
//   const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

//   const categories = [
//     "Earrings",
//     "Necklaces",
//     "Rings",
//     "Bracelets",
//     "Bangles",
//     "Anklets",
//     "Men's Jewellery",
//     "Kid's Jewellery"
//   ];
  
//   const materials = ["Gold", "Silver"];
//   const purities = {
//     Gold: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
//     Silver: ["Fine Silver-99.9%", "Sterling Silver-92.5%"]
//   };

//   const fetchPromotions = async () => {
//     try {
//       const promotionsSnapshot = await getDocs(collection(db, "promotions"));
//       const currentDate = new Date();
//       const activePromotions: { [key: string]: Promotion } = {};

//       promotionsSnapshot.forEach((doc) => {
//         const promoData = doc.data() as Promotion;
//         const startDate = new Date(promoData.startDate);
//         const endDate = new Date(promoData.endDate);

//         if (currentDate >= startDate && currentDate <= endDate) {
//           activePromotions[promoData.productName] = promoData;
//         }
//       });

//       setPromotions(activePromotions);
//       console.log("Active promotions:", activePromotions);
//     } catch (error) {
//       console.error("Error fetching promotions:", error);
//     }
//   };

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists() && docSnap.data().products) {
//           const productsData = docSnap.data().products;
//           setProducts(productsData);
//           await fetchPromotions();
//           console.log("Products fetched:", productsData);
//         } else {
//           console.log("No products found");
//           toast.error("No products available");
//         }
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//         toast.error("Error loading products");
//         setIsLoading(false);
//       }
//     };

//     const savedWishlist = localStorage.getItem('wishlist');
//     if (savedWishlist) {
//       setWishlist(JSON.parse(savedWishlist));
//     }

//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     const calculatePrices = async () => {
//       const priceDocRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
//       try {
//         const priceDocSnap = await getDoc(priceDocRef);
//         if (!priceDocSnap.exists()) return;

//         const priceData = priceDocSnap.data();
//         const prices: { [key: string]: number } = {};

//         products.forEach((product) => {
//           let basePrice = 0;
//           let wastagePercentage = 0;
//           let makingChargesPerGram = 0;
//           let applyWastageMakingCharges = true;

//           switch (product.purity) {
//             case "18 Karat":
//               basePrice = priceData.price18Karat;
//               wastagePercentage = priceData.goldwastageCharges;
//               makingChargesPerGram = priceData.goldmakingCharges;
//               break;
//             case "20 Karat":
//               basePrice = priceData.price20Karat;
//               wastagePercentage = priceData.goldwastageCharges;
//               makingChargesPerGram = priceData.goldmakingCharges;
//               break;
//             case "22 Karat":
//               basePrice = priceData.price22Karat;
//               wastagePercentage = priceData.goldwastageCharges;
//               makingChargesPerGram = priceData.goldmakingCharges;
//               break;
//             case "24 Karat":
//               basePrice = priceData.price24Karat;
//               applyWastageMakingCharges = false;
//               break;
//             case "Fine Silver-99.9%":
//               basePrice = priceData.priceSilver1;
//               wastagePercentage = priceData.wastageChargesSilver;
//               makingChargesPerGram = priceData.makingChargesSilver;
//               break;
//             case "Sterling Silver-92.5%":
//               basePrice = priceData.priceSilver2;
//               wastagePercentage = priceData.wastageChargesSilver;
//               makingChargesPerGram = priceData.makingChargesSilver;
//               break;
//             default:
//               return;
//           }

//           const baseAmount = basePrice * product.weight;
//           let totalPrice = baseAmount;

//           if (applyWastageMakingCharges) {
//             const wastageCharges = baseAmount * (wastagePercentage / 100);
//             const makingCharges = makingChargesPerGram * product.weight;
//             totalPrice = baseAmount + wastageCharges + makingCharges;
//           }

//           const promotion = promotions[product.name];
//           if (promotion) {
//             const discountedBasePrice = basePrice * (1 - promotion.priceDiscount / 100);
//             const discountedWastage = applyWastageMakingCharges
//               ? baseAmount * ((wastagePercentage * (1 - promotion.wastageDiscount / 100)) / 100)
//               : 0;
//             const discountedMaking = applyWastageMakingCharges
//               ? makingChargesPerGram * (1 - promotion.makingChargesDiscount / 100) * product.weight
//               : 0;

//             totalPrice = discountedBasePrice * product.weight + discountedWastage + discountedMaking;
//           }

//           prices[product.name] = totalPrice;
//         });

//         setPriceRanges(prices);
//       } catch (error) {
//         console.error("Error calculating prices:", error);
//       }
//     };

//     if (products.length > 0) {
//       calculatePrices();
//     }
//   }, [products, promotions]);

//   useEffect(() => {
//     const category = searchParams.get("category");
//     const search = searchParams.get("search");

//     let filtered = [...products];

//     // Apply search filter
//     if (search) {
//       const searchLower = search.toLowerCase();
//       filtered = filtered.filter(product => {
//         return (
//           product.name.toLowerCase().includes(searchLower) ||
//           product.productCategory.toLowerCase().includes(searchLower) ||
//           product.material?.toLowerCase().includes(searchLower) ||
//           product.purity?.toLowerCase().includes(searchLower) ||
//           product.weight.toString().includes(searchLower)
//         );
//       });
//     }

//     // Apply category filter
//     if ((category && category !== "all") || (selectedCategory !== "all")) {
//       const filterCategory = category || selectedCategory;
//       filtered = filtered.filter(product => 
//         product.productCategory === filterCategory
//       );
//     }

//     // Apply material filter
//     if (selectedMaterial && selectedMaterial !== "all") {
//       filtered = filtered.filter(product => 
//         product.material === selectedMaterial
//       );
//     }

//     // Apply purity filter
//     if (selectedPurity && selectedPurity !== "all") {
//       filtered = filtered.filter(product => 
//         product.purity === selectedPurity
//       );
//     }

//     // Apply price range filter
//     if (priceRange[0] !== 0 || priceRange[1] !== 1000000) {
//       filtered = filtered.filter(product => {
//         const price = priceRanges[product.name];
//         return price >= priceRange[0] && price <= priceRange[1];
//       });
//     }

//     setFilteredProducts(filtered);
//   }, [searchParams, selectedCategory, selectedMaterial, selectedPurity, priceRange, products, priceRanges]);

//   const handleAddToWishlist = (product: Product) => {
//     setWishlist(prev => {
//       const isInWishlist = prev.some(item => item.name === product.name);
//       let newWishlist: Product[];
      
//       if (isInWishlist) {
//         newWishlist = prev.filter(item => item.name !== product.name);
//         toast.success("Removed from wishlist");
//       } else {
//         newWishlist = [...prev, product];
//         toast.success("Added to wishlist");
//       }
      
//       localStorage.setItem('wishlist', JSON.stringify(newWishlist));
//       return newWishlist;
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-4">
//         <h1 className="text-4xl font-bold mb-8">Our Products</h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[1, 2, 3].map((i) => (
//             <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   const displayProducts = showWishlist ? wishlist : filteredProducts;

//   return (
//     <div className="container mx-auto px-4 pt-32 lg:pt-24">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-2xl lg:text-4xl font-bold">
//           {showWishlist ? "My Wishlist" : "Our Products"}
//         </h1>
//         <button
//           onClick={() => setShowWishlist(!showWishlist)}
//           className="text-primary hover:text-primary/80 font-semibold"
//         >
//           {showWishlist ? "Show All Products" : "Show Wishlist"}
//         </button>
//       </div>

//       {!showWishlist && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Category</label>
//             <Select
//               value={selectedCategory}
//               onValueChange={setSelectedCategory}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select category" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Categories</SelectItem>
//                 {categories.map((category) => (
//                   <SelectItem key={category} value={category}>
//                     {category}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Material</label>
//             <Select
//               value={selectedMaterial}
//               onValueChange={setSelectedMaterial}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select material" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Materials</SelectItem>
//                 {materials.map((material) => (
//                   <SelectItem key={material} value={material}>
//                     {material}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Purity</label>
//             <Select
//               value={selectedPurity}
//               onValueChange={setSelectedPurity}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select purity" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Purities</SelectItem>
//                 {selectedMaterial && purities[selectedMaterial as keyof typeof purities]?.map((purity) => (
//                   <SelectItem key={purity} value={purity}>
//                     {purity}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Price Range</label>
//             <Slider
//               defaultValue={[0, 1000000]}
//               max={1000000}
//               step={1000}
//               onValueChange={(value) => setPriceRange(value as [number, number])}
//               className="mt-6"
//             />
//             <div className="flex justify-between text-sm text-gray-500">
//               <span>₹{priceRange[0].toLocaleString()}</span>
//               <span>₹{priceRange[1].toLocaleString()}</span>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {displayProducts.length === 0 ? (
//           <p className="col-span-full text-center text-gray-500 mt-8">
//             {showWishlist ? "Your wishlist is empty" : "No products found matching your criteria"}
//           </p>
//         ) : (
//           displayProducts.map((product) => (
//             <ProductCard
//               key={product.name}
//               product={product}
//               onAddToWishlist={handleAddToWishlist}
//               isInWishlist={wishlist.some(item => item.name === product.name)}
//               activePromotion={promotions[product.name]}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Products;

import { useEffect, useState } from "react";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ProductCard from "@/components/products/ProductCard";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface Product {
  name: string;
  productCategory: string;
  material?: string;
  purity?: string;
  weight: number;
  imageUrl: string;
  imageUrls?: string[];
  productID?: string;
  timestamp?: {
    seconds: number;
    nanoseconds: number;
  };
}

interface Promotion {
  promotionName: string;
  giftDescription: string;
  priceDiscount: number;
  wastageDiscount: number;
  makingChargesDiscount: number;
  startDate: string;
  endDate: string;
  productName: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [searchParams] = useSearchParams();
  const [promotions, setPromotions] = useState<{ [key: string]: Promotion }>({});
  const [priceRanges, setPriceRanges] = useState<{ [key: string]: number }>({});

  // Advanced filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [selectedPurity, setSelectedPurity] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  const categories = [
    "Earrings",
    "Necklaces",
    "Rings",
    "Bracelets",
    "Bangles",
    "Anklets",
    "Men's Jewellery",
    "Kid's Jewellery"
  ];

  const materials = ["Gold", "Silver"];
  const purities = {
    Gold: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
    Silver: ["Fine Silver-99.9%", "Sterling Silver-92.5%"]
  };

  const fetchPromotions = async () => {
    try {
      const promotionsSnapshot = await getDocs(collection(db, "promotions"));
      const currentDate = new Date();
      const activePromotions: { [key: string]: Promotion } = {};

      promotionsSnapshot.forEach((doc) => {
        const promoData = doc.data() as Promotion;
        const startDate = new Date(promoData.startDate);
        const endDate = new Date(promoData.endDate);

        if (currentDate >= startDate && currentDate <= endDate) {
          activePromotions[promoData.productName] = promoData;
        }
      });

      setPromotions(activePromotions);
      console.log("Active promotions:", activePromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().products) {
          const productsData = docSnap.data().products;

          // Sort products based on timestamp (newest first)
          const sortedProducts = productsData.sort((a: Product, b: Product) => {
            if (a.timestamp && b.timestamp) {
              return b.timestamp.seconds - a.timestamp.seconds;
            }
            return 0;
          });

          setProducts(sortedProducts);
          await fetchPromotions();
          console.log("Products fetched:", sortedProducts);
        } else {
          console.log("No products found");
          toast.error("No products available");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Error loading products");
        setIsLoading(false);
      }
    };

    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    const calculatePrices = async () => {
      const priceDocRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
      try {
        const priceDocSnap = await getDoc(priceDocRef);
        if (!priceDocSnap.exists()) return;

        const priceData = priceDocSnap.data();
        const prices: { [key: string]: number } = {};

        products.forEach((product) => {
          let basePrice = 0;
          let wastagePercentage = 0;
          let makingChargesPerGram = 0;
          let applyWastageMakingCharges = true;

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
              return;
          }

          const baseAmount = basePrice * product.weight;
          let totalPrice = baseAmount;

          if (applyWastageMakingCharges) {
            const wastageCharges = baseAmount * (wastagePercentage / 100);
            const makingCharges = makingChargesPerGram * product.weight;
            totalPrice = baseAmount + wastageCharges + makingCharges;
          }

          const promotion = promotions[product.name];
          if (promotion) {
            const discountedBasePrice = basePrice * (1 - promotion.priceDiscount / 100);
            const discountedWastage = applyWastageMakingCharges
              ? baseAmount * ((wastagePercentage * (1 - promotion.wastageDiscount / 100)) / 100)
              : 0;
            const discountedMaking = applyWastageMakingCharges
              ? makingChargesPerGram * (1 - promotion.makingChargesDiscount / 100) * product.weight
              : 0;

            totalPrice = discountedBasePrice * product.weight + discountedWastage + discountedMaking;
          }

          prices[product.name] = totalPrice;
        });

        setPriceRanges(prices);
      } catch (error) {
        console.error("Error calculating prices:", error);
      }
    };

    if (products.length > 0) {
      calculatePrices();
    }
  }, [products, promotions]);

  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let filtered = [...products];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(product => {
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.productCategory.toLowerCase().includes(searchLower) ||
          product.material?.toLowerCase().includes(searchLower) ||
          product.purity?.toLowerCase().includes(searchLower) ||
          product.weight.toString().includes(searchLower)
        );
      });
    }

    // Apply category filter
    if ((category && category !== "all") || (selectedCategory !== "all")) {
      const filterCategory = category || selectedCategory;
      filtered = filtered.filter(product => 
        product.productCategory === filterCategory
      );
    }

    // Apply material filter
    if (selectedMaterial && selectedMaterial !== "all") {
      filtered = filtered.filter(product => 
        product.material === selectedMaterial
      );
    }

    // Apply purity filter
    if (selectedPurity && selectedPurity !== "all") {
      filtered = filtered.filter(product => 
        product.purity === selectedPurity
      );
    }

    // Apply price range filter
    if (priceRange[0] !== 0 || priceRange[1] !== 1000000) {
      filtered = filtered.filter(product => {
        const price = priceRanges[product.name];
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    setFilteredProducts(filtered);
  }, [searchParams, selectedCategory, selectedMaterial, selectedPurity, priceRange, products, priceRanges]);

  const handleAddToWishlist = (product: Product) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.name === product.name);
      let newWishlist: Product[];
      
      if (isInWishlist) {
        newWishlist = prev.filter(item => item.name !== product.name);
        toast.success("Removed from wishlist");
      } else {
        newWishlist = [...prev, product];
        toast.success("Added to wishlist");
      }
      
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const displayProducts = showWishlist ? wishlist : filteredProducts;

  return (
    <div className="container mx-auto px-4 pt-32 lg:pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl lg:text-4xl font-bold">
          {showWishlist ? "My Wishlist" : "Our Products"}
        </h1>
        <button
          onClick={() => setShowWishlist(!showWishlist)}
          className="text-primary hover:text-primary/80 font-semibold"
        >
          {showWishlist ? "Show All Products" : "Show Wishlist"}
        </button>
      </div>

      {!showWishlist && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Material</label>
            <Select
              value={selectedMaterial}
              onValueChange={setSelectedMaterial}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                {materials.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Purity</label>
            <Select
              value={selectedPurity}
              onValueChange={setSelectedPurity}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purities</SelectItem>
                {selectedMaterial && purities[selectedMaterial as keyof typeof purities]?.map((purity) => (
                  <SelectItem key={purity} value={purity}>
                    {purity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range</label>
            <Slider
              defaultValue={[0, 1000000]}
              max={1000000}
              step={1000}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mt-6"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProducts.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 mt-8">
            {showWishlist ? "Your wishlist is empty" : "No products found matching your criteria"}
          </p>
        ) : (
          displayProducts.map((product) => (
            <ProductCard
              key={product.name}
              product={product}
              onAddToWishlist={handleAddToWishlist}
              isInWishlist={wishlist.some(item => item.name === product.name)}
              activePromotion={promotions[product.name]}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
