// // import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { auth, db } from "@/lib/firebase";
// // import { onAuthStateChanged } from "firebase/auth";
// // import { doc, getDoc, collection, getDocs } from "firebase/firestore";
// // import PriceUpdateForm from "@/components/admin/PriceUpdateForm";
// // import ProductForm from "@/components/admin/ProductForm";
// // import { toast } from "sonner";
// // import PromotionForm from "@/components/admin/PromotionForm";
// // import PromotionList from "@/components/admin/promotion/PromotionList";
// // import UserProfile from "@/components/admin/dashboard/UserProfile";
// // import PriceDisplay from "@/components/admin/dashboard/PriceDisplay";
// // import CustomerManagement from "@/components/admin/dashboard/CustomerManagement";
// // import type { CustomerData } from "@/types/customer";
// // import { Button } from "@/components/ui/button";

// // const Admin = () => {
// //   const navigate = useNavigate();
// //   const [userData, setUserData] = useState<any>(null);
// //   const [priceData, setPriceData] = useState<any>(null);
// //   const [priceUpdateTime, setPriceUpdateTime] = useState<string>("");
// //   const [showPromotionForm, setShowPromotionForm] = useState(false);
// //   const [customers, setCustomers] = useState<CustomerData[]>([]);
// //   const [products, setProducts] = useState<any[]>([]);

// //   useEffect(() => {
// //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
// //       if (!user) {
// //         toast.error("Please login to access the admin page");
// //         navigate("/login");
// //         return;
// //       }

// //       try {
// //         // Fetch user data
// //         const userDoc = await getDoc(doc(db, "users", user.uid));
// //         if (userDoc.exists()) {
// //           setUserData(userDoc.data());
// //         }

// //         // Fetch products
// //         const productsDoc = await getDoc(doc(db, "productData", "Ng4pODDHfqytrF2iqMtR"));
// //         if (productsDoc.exists()) {
// //           setProducts(productsDoc.data().products || []);
// //         }

// //         // Fetch customers
// //         const customersSnapshot = await getDocs(collection(db, "customerData"));
// //         const customersList = customersSnapshot.docs.map(doc => ({
// //           id: doc.id,
// //           ...doc.data()
// //         } as CustomerData));
// //         setCustomers(customersList);

// //         // Fetch price data
// //         const priceDoc = await getDoc(doc(db, "priceData", "9wWClo0OSjIY6odJfvN4"));
// //         if (priceDoc.exists()) {
// //           setPriceData(priceDoc.data());
// //           setPriceUpdateTime(new Date(priceDoc.data().timestamp?.toDate()).toLocaleString() || "N/A");
// //         }
// //       } catch (error) {
// //         console.error("Error fetching data:", error);
// //         toast.error("Error fetching data");
// //       }
// //     });

// //     return () => unsubscribe();
// //   }, [navigate]);

// //   return (
// //     <div className="container mx-auto px-4 py-8 space-y-8">
// //       <UserProfile userData={userData} />

// //       {priceData && (
// //         <PriceDisplay priceData={priceData} priceUpdateTime={priceUpdateTime} />
// //       )}

// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// //         <PriceUpdateForm />
// //         <ProductForm />
// //       </div>

// //       <div className="bg-card p-6 rounded-lg shadow-md space-y-4">
// //         <div className="flex justify-between items-center">
// //           <h2 className="text-2xl font-bold">Promotions</h2>
// //           <Button onClick={() => setShowPromotionForm(!showPromotionForm)}>
// //             {showPromotionForm ? "Hide Promotion Form" : "Add New Promotion"}
// //           </Button>
// //         </div>
// //         {showPromotionForm && <PromotionForm products={products} />}
// //         <PromotionList />
// //       </div>

// //       <CustomerManagement customers={customers} setCustomers={setCustomers} />
// //     </div>
// //   );
// // };

// // export default Admin;
// //-----------------------------------------------------------------------------------//
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, db } from "@/lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc, collection, getDocs } from "firebase/firestore";
// import PriceUpdateForm from "@/components/admin/PriceUpdateForm";
// import ProductForm from "@/components/admin/ProductForm";
// import { toast } from "sonner";
// import PromotionForm from "@/components/admin/PromotionForm";
// import PromotionList from "@/components/admin/promotion/PromotionList";
// import UserProfile from "@/components/admin/dashboard/UserProfile";
// import PriceDisplay from "@/components/admin/dashboard/PriceDisplay";
// import CustomerManagement from "@/components/admin/dashboard/CustomerManagement";
// import type { CustomerData } from "@/types/customer";
// import { Button } from "@/components/ui/button";
// import AddImage from "@/components/admin/addimage";

// const Admin = () => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<any>(null);
//   const [priceData, setPriceData] = useState<any>(null);
//   const [priceUpdateTime, setPriceUpdateTime] = useState<string>("");
//   const [showPromotionForm, setShowPromotionForm] = useState(false);
//   const [customers, setCustomers] = useState<CustomerData[]>([]);
//   const [products, setProducts] = useState<any[]>([]);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         toast.error("Please login to access the admin page");
//         navigate("/login");
//         return;
//       }

//       try {
//         // Fetch user data
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           setUserData(userDoc.data());
//         }

//         // Fetch products
//         const productsDoc = await getDoc(doc(db, "productData", "Ng4pODDHfqytrF2iqMtR"));
//         if (productsDoc.exists()) {
//           setProducts(productsDoc.data().products || []);
//         }

//         // Fetch customers
//         const customersSnapshot = await getDocs(collection(db, "customerData"));
//         const customersList = customersSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data()
//         })) as CustomerData[];
//         setCustomers(customersList);

//         // Fetch price data
//         const priceDoc = await getDoc(doc(db, "priceData", "9wWClo0OSjIY6odJfvN4"));
//         if (priceDoc.exists()) {
//           setPriceData(priceDoc.data());
//           setPriceUpdateTime(new Date(priceDoc.data().timestamp?.toDate()).toLocaleString() || "N/A");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         toast.error("Error fetching data");
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   return (
//     <div className="container mx-auto px-4 py-8 space-y-8">
//       <UserProfile userData={userData} />

//       {priceData && (
//         <PriceDisplay priceData={priceData} priceUpdateTime={priceUpdateTime} />
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <PriceUpdateForm />
//         <ProductForm />
//       </div>

//       <div className="bg-card p-6 rounded-lg shadow-md space-y-4">
//         <div className="flex justify-between items-center">
//           <h2 className="text-2xl font-bold">Promotions</h2>
//           <Button onClick={() => setShowPromotionForm(!showPromotionForm)}>
//             {showPromotionForm ? "Hide Promotion Form" : "Add New Promotion"}
//           </Button>
//         </div>
//         {showPromotionForm && <PromotionForm products={products} />}
//         <PromotionList />
//       </div>

//       {/* New Gallery Management Section */}
//       <div className="bg-card p-6 rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold mb-4">Gallery Management</h2>
//         <AddImage />
//       </div>

//       <CustomerManagement customers={customers} setCustomers={setCustomers} />
//     </div>
//   );
// };

// export default Admin;


// ////////----------------------------------////
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, db } from "@/lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc, collection, getDocs } from "firebase/firestore";
// import PriceUpdateForm from "@/components/admin/PriceUpdateForm";
// import ProductForm from "@/components/admin/ProductForm";
// import { toast } from "sonner";
// import PromotionForm from "@/components/admin/PromotionForm";
// import PromotionList from "@/components/admin/promotion/PromotionList";
// import UserProfile from "@/components/admin/dashboard/UserProfile";
// import PriceDisplay from "@/components/admin/dashboard/PriceDisplay";
// import LiveMetalPrices from "@/components/admin/dashboard/LiveMetalPrices";
// import CustomerManagement from "@/components/admin/dashboard/CustomerManagement";
// import type { CustomerData } from "@/types/customer";
// import { Button } from "@/components/ui/button";
// import AddImage from "@/components/admin/addimage";

// const Admin = () => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<any>(null);
//   const [priceData, setPriceData] = useState<any>(null);
//   const [priceUpdateTime, setPriceUpdateTime] = useState<string>("");
//   const [showPromotionForm, setShowPromotionForm] = useState(false);
//   const [customers, setCustomers] = useState<CustomerData[]>([]);
//   const [products, setProducts] = useState<any[]>([]);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         toast.error("Please login to access the admin page");
//         navigate("/login");
//         return;
//       }

//       try {
//         // Fetch user data
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           setUserData(userDoc.data());
//         }

//         // Fetch products
//         const productsDoc = await getDoc(doc(db, "productData", "Ng4pODDHfqytrF2iqMtR"));
//         if (productsDoc.exists()) {
//           setProducts(productsDoc.data().products || []);
//         }

//         // Fetch customers
//         const customersSnapshot = await getDocs(collection(db, "customerData"));
//         const customersList = customersSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         } as CustomerData));
//         setCustomers(customersList);

//         // Fetch price data
//         const priceDoc = await getDoc(doc(db, "priceData", "9wWClo0OSjIY6odJfvN4"));
//         if (priceDoc.exists()) {
//           setPriceData(priceDoc.data());
//           setPriceUpdateTime(new Date(priceDoc.data().timestamp?.toDate()).toLocaleString() || "N/A");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         toast.error("Error fetching data");
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   return (
//     <div className="container mx-auto px-4 py-8 space-y-8">
//       <UserProfile userData={userData} />

//       <LiveMetalPrices />

//       {priceData && (
//         <PriceDisplay priceData={priceData} priceUpdateTime={priceUpdateTime} />
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <PriceUpdateForm />
//         <ProductForm />
//       </div>

//       <div className="bg-card p-6 rounded-lg shadow-md space-y-4">
//         <div className="flex justify-between items-center">
//           <h2 className="text-2xl font-bold">Promotions</h2>
//           <Button onClick={() => setShowPromotionForm(!showPromotionForm)}>
//             {showPromotionForm ? "Hide Promotion Form" : "Add New Promotion"}
//           </Button>
//         </div>
//         {showPromotionForm && <PromotionForm products={products} />}
//         <PromotionList />
//       </div>

//       <div className="bg-card p-6 rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold mb-4">Gallery Management</h2>
//         <AddImage />
//       </div>

//       <CustomerManagement customers={customers} setCustomers={setCustomers} />
//     </div>
//   );
// };

// export default Admin;



// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, db } from "@/lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
// import PriceUpdateForm from "@/components/admin/PriceUpdateForm";
// import ProductForm from "@/components/admin/ProductForm";
// import { toast } from "sonner";
// import PromotionForm from "@/components/admin/PromotionForm";
// import PromotionList from "@/components/admin/promotion/PromotionList";
// import PriceDisplay from "@/components/admin/dashboard/PriceDisplay";
// import LiveMetalPrices from "@/components/admin/dashboard/LiveMetalPrices";
// import CustomerManagement from "@/components/admin/dashboard/CustomerManagement";
// import type { CustomerData } from "@/types/customer";
// import { Button } from "@/components/ui/button";
// import AddImage from "@/components/admin/addimage";
// import { Users, ShoppingBag, Package, Star, MessageSquare, FileText, Bell, Settings, User, LogOut } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// const Admin = () => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<any>(null);
//   const [priceData, setPriceData] = useState<any>(null);
//   const [priceUpdateTime, setPriceUpdateTime] = useState<string>("");
//   const [showPromotionForm, setShowPromotionForm] = useState(false);
//   const [customers, setCustomers] = useState<CustomerData[]>([]);
//   const [products, setProducts] = useState<any[]>([]);
//   const [notifications, setNotifications] = useState<number>(3);
//   const [newName, setNewName] = useState("");
//   const [newImageUrl, setNewImageUrl] = useState("");
//   const [isProfileOpen, setIsProfileOpen] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         toast.error("Please login to access the admin page");
//         navigate("/login");
//         return;
//       }

//       try {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           setUserData(userDoc.data());
//           setNewName(`${userDoc.data().firstName || ''} ${userDoc.data().lastName || ''}`);
//           setNewImageUrl(userDoc.data().profileImageUrl || "");
//         }

//         const customersSnapshot = await getDocs(collection(db, "customerData"));
//         setCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerData)));
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         toast.error("Error fetching data");
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   const dashboardCards = [
//     { title: "Total Users", value: customers.length, color: "bg-[#9b87f5]", icon: Users },
//     { title: "New Orders", value: 0, color: "bg-[#7E69AB]", icon: ShoppingBag },
//     { title: "Delivered Orders", value: 0, color: "bg-[#D6BCFA]", icon: Package },
//     { title: "Reviews", value: 0, color: "bg-[#1A1F2C]", icon: Star },
//     { title: "Pending Enquiries", value: 0, color: "bg-[#8E9196]", icon: MessageSquare },
//     { title: "New Reports", value: 0, color: "bg-[#C8C8C9]", icon: FileText },
//   ];

//   return (
//     <div className="container mx-auto px-4 py-8 space-y-8">
//       <div className="flex justify-between items-center bg-white p-4 shadow-sm">
//         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//         <div className="flex items-center space-x-6">
//           <Button variant="ghost" className="relative p-2">
//             <Bell className="h-5 w-5" />
//             {notifications > 0 && (
//               <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
//                 {notifications}
//               </span>
//             )}
//           </Button>
//           <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="relative h-10 w-10 rounded-full">
//                 <Avatar>
//                   <AvatarImage src={userData?.profileImageUrl} />
//                   <AvatarFallback>
//                     <User className="h-6 w-6" />
//                   </AvatarFallback>
//                 </Avatar>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-56">
//               <DropdownMenuLabel>My Account</DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>Profile Settings</DropdownMenuItem>
//               <DropdownMenuItem onClick={() => auth.signOut()}>
//                 <LogOut className="mr-2 h-4 w-4" />
//                 Log out
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {dashboardCards.map((card, index) => (
//           <div key={index} className={`${card.color} rounded-lg p-6 text-white shadow-lg`}>
//             <card.icon className="h-12 w-12 opacity-80" />
//             <h3 className="text-xl font-bold mt-2">{card.title}</h3>
//             <p className="text-3xl font-semibold">{card.value}</p>
//           </div>
//         ))}
//       </div>
//       <LiveMetalPrices />
//       {priceData && <PriceDisplay priceData={priceData} priceUpdateTime={priceUpdateTime} />}
//       <ProductForm />
//       <PriceUpdateForm />
//       <AddImage />
//       <CustomerManagement customers={customers} setCustomers={setCustomers} />
//     </div>
//   );
// };

// export default Admin;



// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, db } from "@/lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
// import PriceUpdateForm from "@/components/admin/PriceUpdateForm";
// import ProductForm from "@/components/admin/ProductForm";
// import { toast } from "sonner";
// import PromotionForm from "@/components/admin/PromotionForm";
// import PromotionList from "@/components/admin/promotion/PromotionList";
// import PriceDisplay from "@/components/admin/dashboard/PriceDisplay";
// import LiveMetalPrices from "@/components/admin/dashboard/LiveMetalPrices";
// import CustomerManagement from "@/components/admin/dashboard/CustomerManagement";
// import type { CustomerData } from "@/types/customer";
// import { Button } from "@/components/ui/button";
// import AddImage from "@/components/admin/addimage";
// import { Users, ShoppingBag, Package, Star, MessageSquare, FileText, Bell, Settings, User, LogOut } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// const Admin = () => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<any>(null);
//   const [priceData, setPriceData] = useState<any>(null);
//   const [priceUpdateTime, setPriceUpdateTime] = useState<string>("");
//   const [showPromotionForm, setShowPromotionForm] = useState(false);
//   const [customers, setCustomers] = useState<CustomerData[]>([]);
//   const [products, setProducts] = useState<any[]>([]);
//   const [notifications, setNotifications] = useState<number>(3);
//   const [newName, setNewName] = useState("");
//   const [newImageUrl, setNewImageUrl] = useState("");
//   const [isProfileOpen, setIsProfileOpen] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         toast.error("Please login to access the admin page");
//         navigate("/login");
//         return;
//       }

//       try {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           const data = userDoc.data();
//           setUserData(data);
//           setNewName(`${data.firstName || ''} ${data.lastName || ''}`);
//           setNewImageUrl(data.profileImageUrl || "");
//         }

//         const productsDoc = await getDoc(doc(db, "productData", "Ng4pODDHfqytrF2iqMtR"));
//         if (productsDoc.exists()) {
//           setProducts(productsDoc.data().products || []);
//         }

//         const customersSnapshot = await getDocs(collection(db, "customerData"));
//         const customersList = customersSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         } as CustomerData));
//         setCustomers(customersList);

//         const priceDoc = await getDoc(doc(db, "priceData", "9wWClo0OSjIY6odJfvN4"));
//         if (priceDoc.exists()) {
//           setPriceData(priceDoc.data());
//           setPriceUpdateTime(new Date(priceDoc.data().timestamp?.toDate()).toLocaleString() || "N/A");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         toast.error("Error fetching data");
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   const updateProfile = async () => {
//     if (!auth.currentUser) {
//       toast.error("No user logged in");
//       return;
//     }

//     try {
//       const [firstName, ...lastNameParts] = newName.trim().split(" ");
//       const lastName = lastNameParts.join(" ");

//       await updateDoc(doc(db, "users", auth.currentUser.uid), {
//         firstName,
//         lastName,
//         profileImageUrl: newImageUrl
//       });

//       setUserData(prev => ({
//         ...prev,
//         firstName,
//         lastName,
//         profileImageUrl: newImageUrl
//       }));

//       toast.success("Profile updated successfully");
//       setIsProfileOpen(false);
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       toast.error("Failed to update profile");
//     }
//   };

//   const dashboardCards = [
//     { title: "Total Users", value: customers.length, color: "bg-[#9b87f5]", icon: Users },
//     { title: "New Orders", value: 0, color: "bg-[#7E69AB]", icon: ShoppingBag },
//     { title: "Delivered Orders", value: 0, color: "bg-[#D6BCFA]", icon: Package },
//     { title: "Reviews", value: 0, color: "bg-[#1A1F2C]", icon: Star },
//     { title: "Pending Enquiries", value: 0, color: "bg-[#8E9196]", icon: MessageSquare },
//     { title: "New Reports", value: 0, color: "bg-[#C8C8C9]", icon: FileText },
//   ];

//   return (
//     <div className="min-h-screen bg-[#F1F0FB]">
//       {/* Top Navigation Bar */}
//       <div className="bg-white shadow-sm sticky top-20 z-50">
//         <div className="container mx-auto px-4 py-3">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center space-x-4">
//               <h1 className="text-2xl font-bold text-gray-800 m-0">
//                 {userData?.firstName} {userData?.lastName}
//               </h1>
//             </div>

//             <div className="flex items-center space-x-6">
//               {/* Notifications */}
//               <Button variant="ghost" className="relative p-2">
//                 <Bell className="h-5 w-5" />
//                 {notifications > 0 && (
//                   <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
//                     {notifications}
//                   </span>
//                 )}
//               </Button>

//               {/* User Menu */}
//               <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="relative h-10 w-10 rounded-full">
//                     <Avatar>
//                       <AvatarImage src={userData?.profileImageUrl} />
//                       <AvatarFallback>
//                         <User className="h-6 w-6" />
//                       </AvatarFallback>
//                     </Avatar>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
//                         <Settings className="mr-2 h-4 w-4" />
//                         Profile Settings
//                       </DropdownMenuItem>
//                     </DialogTrigger>
//                     <DialogContent>
//                       <DialogHeader>
//                         <DialogTitle>Edit Profile</DialogTitle>
//                       </DialogHeader>
//                       <div className="space-y-4 py-4">
//                         <div className="space-y-2">
//                           <Label htmlFor="name">Name</Label>
//                           <Input
//                             id="name"
//                             value={newName}
//                             onChange={(e) => setNewName(e.target.value)}
//                             placeholder="Your name"
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label htmlFor="image">Profile Image URL</Label>
//                           <Input
//                             id="image"
//                             value={newImageUrl}
//                             onChange={(e) => setNewImageUrl(e.target.value)}
//                             placeholder="Image URL"
//                           />
//                         </div>
//                         <Button onClick={updateProfile} className="w-full">
//                           Update Profile
//                         </Button>
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                   <DropdownMenuItem onClick={() => auth.signOut()}>
//                     <LogOut className="mr-2 h-4 w-4" />
//                     Log out
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//         {dashboardCards.map((card, index) => (
//           <div key={index} className={`${card.color} rounded-lg p-6 text-white shadow-lg`}>
//             <card.icon className="h-12 w-12 opacity-80" />
//             <h3 className="text-xl font-bold mt-2">{card.title}</h3>
//             <p className="text-3xl font-semibold">{card.value}</p>
//           </div>
//         ))} 
//       </div>


//       <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
//         <div>
//           <LiveMetalPrices />
//         </div>
//       </div>



//       <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
//         {priceData && <PriceDisplay priceData={priceData} priceUpdateTime={priceUpdateTime} />}
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
//         <ProductForm />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
//         <PriceUpdateForm />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
//         <AddImage />
//       </div>

//       <div className="bg-white rounded-lg shadow-md p-6 mt-6">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">Promotions</h2>
//           <Button onClick={() => setShowPromotionForm(!showPromotionForm)}>
//             {showPromotionForm ? "Hide Form" : "Add New"}
//           </Button>
//         </div>
//         {showPromotionForm && <PromotionForm products={products} />}
//         <PromotionList />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
//         <CustomerManagement customers={customers} setCustomers={setCustomers} />
//       </div>
//       {/* Profile Settings Dialog */}
//       <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Update Profile</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="name">Full Name</Label>
//               <Input
//                 id="name"
//                 value={newName}
//                 onChange={(e) => setNewName(e.target.value)}
//                 placeholder="First and Last Name"
//               />
//             </div>

//             <div>
//               <Label htmlFor="imageUrl">Profile Image URL</Label>
//               <Input
//                 id="imageUrl"
//                 value={newImageUrl}
//                 onChange={(e) => setNewImageUrl(e.target.value)}
//                 placeholder="Enter profile image URL"
//               />
//             </div>

//             <div className="flex justify-end space-x-4 mt-4">
//               <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={updateProfile}>Save Changes</Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default Admin;




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import PriceUpdateForm from "@/components/admin/PriceUpdateForm";
import ProductForm from "@/components/admin/ProductForm";
import { toast } from "sonner";
import PromotionForm from "@/components/admin/PromotionForm";
import PromotionList from "@/components/admin/promotion/PromotionList";
import PriceDisplay from "@/components/admin/dashboard/PriceDisplay";
import LiveMetalPrices from "@/components/admin/dashboard/LiveMetalPrices";
import CustomerManagement from "@/components/admin/dashboard/CustomerManagement";
import type { CustomerData } from "@/types/customer";
import { Button } from "@/components/ui/button";
import AddImage from "@/components/admin/addimage";
import {
  Users, ShoppingBag, Package, Star,
  MessageSquare, FileText, Bell,
  Settings, User, LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Admin = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [priceUpdateTime, setPriceUpdateTime] = useState<string>("");
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<number>(3);
  const [newName, setNewName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("Please login to access the admin page");
        navigate("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setNewName(`${data.firstName || ''} ${data.lastName || ''}`);
          setNewImageUrl(data.profileImageUrl || "");
        }

        const productsDoc = await getDoc(doc(db, "productData", "Ng4pODDHfqytrF2iqMtR"));
        if (productsDoc.exists()) {
          setProducts(productsDoc.data().products || []);
        }

        const customersSnapshot = await getDocs(collection(db, "customerData"));
        const customersList = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CustomerData));
        setCustomers(customersList);

        const priceDoc = await getDoc(doc(db, "priceData", "9wWClo0OSjIY6odJfvN4"));
        if (priceDoc.exists()) {
          setPriceData(priceDoc.data());
          setPriceUpdateTime(new Date(priceDoc.data().timestamp?.toDate()).toLocaleString() || "N/A");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const updateProfile = async () => {
    if (!auth.currentUser) {
      toast.error("No user logged in");
      return;
    }

    try {
      const [firstName, ...lastNameParts] = newName.trim().split(" ");
      const lastName = lastNameParts.join(" ");

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        firstName,
        lastName,
        profileImageUrl: newImageUrl
      });

      setUserData(prev => ({
        ...prev,
        firstName,
        lastName,
        profileImageUrl: newImageUrl
      }));

      toast.success("Profile updated successfully");
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const dashboardCards = [
    {
      title: "Total Users",
      value: customers.length,
      color: "bg-[#9b87f5]",
      icon: Users,
      link: "#users",
      description: "Active registered users"
    },
    {
      title: "New Orders",
      value: 0,
      color: "bg-[#7E69AB]",
      icon: ShoppingBag,
      link: "#orders",
      description: "Orders pending processing"
    },
    {
      title: "Delivered Orders",
      value: 0,
      color: "bg-[#D6BCFA]",
      icon: Package,
      link: "#delivered",
      description: "Successfully delivered"
    },
    {
      title: "Reviews",
      value: 0,
      color: "bg-[#1A1F2C]",
      icon: Star,
      link: "#reviews",
      description: "Customer feedback"
    },
    {
      title: "Pending Enquiries",
      value: 0,
      color: "bg-[#8E9196]",
      icon: MessageSquare,
      link: "#enquiries",
      description: "Awaiting response"
    },
    {
      title: "New Reports",
      value: 0,
      color: "bg-[#C8C8C9]",
      icon: FileText,
      link: "#reports",
      description: "Generated reports"
    },
  ];

  return (
    <div className="min-h-screen  bg-[#9aadeb]"> 
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm sticky top--1 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800 m-0">
               Hello 👋 {userData?.firstName} {userData?.lastName}
              </h1>
            </div>

            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <Button variant="ghost" className="relative p-2">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={userData?.profileImageUrl} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image">Profile Image URL</Label>
                          <Input
                            id="image"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Image URL"
                          />
                        </div>
                        <Button onClick={updateProfile} className="w-full">
                          Update Profile
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenuItem onClick={() => auth.signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <a
              key={index}
              href={card.link}
              className={`${card.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium opacity-90">{card.title}</p>
                  <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
                  <p className="text-sm opacity-75 mt-2">{card.description}</p>
                </div>
                <card.icon className="h-12 w-12 opacity-80" />
              </div>
            </a>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Live Metal Prices */}
            <div className="bg-transparent rounded-lg shadow-md p-4">
              <LiveMetalPrices />
            </div>

            {/* Price Display & Update */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {priceData && (
                <div className="bg-transparent rounded-lg shadow-md p-6">
                  <PriceDisplay priceData={priceData} priceUpdateTime={priceUpdateTime} />
                </div>
              )}
              <div className="bg-transparent rounded-lg shadow-md p-6">
                <PriceUpdateForm />
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Product Form */}
              <div className="bg-transparent rounded-lg shadow-md p-6">
                <ProductForm />
              </div>

              {/* Gallery Management */}
              <div className="bg-transparent rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Gallery Management</h2>
                <AddImage />
              </div>

              {/* Promotions */}
              <div className="bg-white rounded-lg shadow-md p-6 ">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Promotions</h2>
                  <Button onClick={() => setShowPromotionForm(!showPromotionForm)}>
                    {showPromotionForm ? "Hide Form" : "Add New"}
                  </Button>
                </div>
                {showPromotionForm && <PromotionForm products={products} />}
                <PromotionList />
              </div>

              
            {/* Customer Management */}
            <div className="bg-transparent rounded-lg shadow-md p-6 ">
            
              <CustomerManagement customers={customers} setCustomers={setCustomers} />
            
            </div>
            

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;