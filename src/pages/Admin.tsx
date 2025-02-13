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
  MessageSquare, Bell, FileText,
  Settings, User, LogOut, BarChart3
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [totalUsers, setTotalUsers] = useState<number>(0);

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

        const productsDoc = await getDoc(doc(db, "productData", "zzeEfRyePYTdWemfHHWH"));
        if (productsDoc.exists()) {
          setProducts(productsDoc.data().products || []);
        }

        const customersSnapshot = await getDocs(collection(db, "customerData"));
        const customersList = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CustomerData));
        setCustomers(customersList);

        const priceDoc = await getDoc(doc(db, "priceData", "4OhZCKHQls64bokVqGN5"));
        if (priceDoc.exists()) {
          setPriceData(priceDoc.data());
          setPriceUpdateTime(new Date(priceDoc.data().timestamp?.toDate()).toLocaleString() || "N/A");
        }

        const usersSnapshot = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnapshot.size);
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
      value: totalUsers,
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
      color: "bg-[#8E9196]",
      icon: BarChart3,
      link: "/admin/reports",
      description: "View product analytics and reports"
    }
  ];

  return (
    <div className="min-h-screen bg-[#9aadeb] mt-16 lg:mt-0"> 
      <div className="bg-white shadow-sm sticky top-16 lg:top-18 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 m-0">
                Hello 👋 {userData?.firstName} {userData?.lastName}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="relative p-2">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userData?.profileImageUrl} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
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

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {dashboardCards.map((card, index) => (
            <a
              key={index}
              href={card.link}
              className={`${card.color} rounded-lg p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base md:text-lg font-medium opacity-90">{card.title}</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">{card.value}</h3>
                  <p className="text-sm opacity-75 mt-2">{card.description}</p>
                </div>
                <card.icon className="h-8 w-8 md:h-12 md:w-12 opacity-80" />
              </div>
            </a>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <LiveMetalPrices />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {priceData && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <PriceDisplay priceData={priceData} priceUpdateTime={priceUpdateTime} />
              </div>
            )}
            <div className="bg-white rounded-lg shadow-md p-4">
              <PriceUpdateForm />
            </div>
          </div>

          <div className=" bg-white rounded-lg lg:col-span-4 space-y-6">
              {/* Product Form */}
              <div className="bg-transparent rounded-lg shadow-md p-6">
                <ProductForm />
              </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="text-2xl font-bold">Promotions</h2>
              <Button 
                onClick={() => setShowPromotionForm(!showPromotionForm)}
                className="w-full sm:w-auto"
              >
                {showPromotionForm ? "Hide Form" : "Add New"}
              </Button>
            </div>
            {showPromotionForm && (
              <div className="overflow-x-auto">
                <PromotionForm products={products} />
              </div>
            )}
            <div className="overflow-x-auto">
              <PromotionList />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-2xl font-bold mb-4">Gallery Management</h2>
            <AddImage />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <CustomerManagement customers={customers} setCustomers={setCustomers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
