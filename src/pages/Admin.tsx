import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, updateDoc, addDoc, writeBatch, serverTimestamp, deleteDoc } from "firebase/firestore";
import PriceUpdateForm from "@/components/admin/PriceUpdateForm";
import ProductForm from "@/components/admin/ProductForm";
import { toast } from "sonner";
import PromotionForm from "@/components/admin/PromotionForm";
import PromotionList from "@/components/admin/promotion/PromotionList";
import PriceDisplay from "@/components/admin/dashboard/PriceDisplay";
import LiveMetalPrices from "@/components/admin/dashboard/LiveMetalPrices";
import CustomerManagement from "@/components/admin/dashboard/CustomerManagement";
import type { CustomerData } from "@/types/customer";
import type { ContactInquiry, AppointmentRequest, ContactInquiryType } from "@/types/contact";
import { Button } from "@/components/ui/button";
import AddImage from "@/components/admin/addimage";
import {
  Users, ShoppingBag, Package, Star,
  MessageSquare, Bell, FileText,
  Settings, User, LogOut, BarChart3,
  FolderTree, Tag, TrendingUp, Image,
  Loader2
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
import type { Category } from "@/types/category";
import { DashboardAnalytics } from "@/components/admin/analytics/DashboardAnalytics";
import { InventoryManagement } from "@/components/admin/inventory/InventoryManagement";
import { PromotionManagement } from "@/components/admin/promotions/PromotionManagement";
import { WhatsAppMarketing } from "@/components/admin/marketing/WhatsAppMarketing";
import { CustomerSegments } from "@/components/admin/customers/CustomerSegments";
import { SalesForecasting } from "@/components/admin/analytics/SalesForecasting";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CategoryForm from "@/components/admin/CategoryForm";
import { slugify } from "@/lib/utils";
import type { NewCategory } from "@/types/category";
import CategoryManagement from "@/pages/admin/CategoryManagement";
import { DoughnutChart } from "@/components/ui/charts";
import GalleryForm from "@/components/admin/GalleryForm";
import CustomerForm from "@/components/admin/CustomerForm";
import { automatedNotificationService } from "@/services/automatedNotificationService";
import { WhatsAppDashboard } from "@/components/admin/marketing/WhatsAppDashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contactService } from "@/services/contactService";
import { Timestamp } from "firebase/firestore";

type Section = 'dashboard' | 'analytics' | 'inventory' | 'marketing' | 'customers' | 'reports' | 'categories' | 'contact';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState(0);
  const [subCategories, setSubCategories] = useState(0);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const defaultCategory: Category = {
    id: 'new',
    name: '',
    slug: '',
    parentId: null,
    level: 1,
    isActive: true,
    sortOrder: 0,
    showInHeader: false,
    attributes: [],
    materialOptions: [],
    path: '',
    hasChildren: false
  };
  const [defaultSuggestedCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add performance tracking state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalLoadTime: 0,
    dataFetchTime: 0,
    renderTime: 0,
    initializationTime: 0
  });

  // Add performance tracking ref
  const performanceRef = useRef({
    startTime: 0,
    dataFetchStart: 0,
    renderStart: 0
  });

  // Add these state variables at the top of the Admin component
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [contactStats, setContactStats] = useState<any>(null);
  const [isLoadingContact, setIsLoadingContact] = useState(false);

  // Add new state variables
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string>('consultation');

  // Add performance monitoring initialization
  useLayoutEffect(() => {
    performanceRef.current.startTime = window.performance.now();
    console.log('Admin page load started at:', new Date().toISOString());
  }, []);

  const fetchData = async () => {
    const startTime = window.performance.now();
    console.log('Starting data initialization at:', new Date().toISOString());
    
    try {
      // Fetch fresh data in parallel
      const fetchStartTime = window.performance.now();
      const [
        priceDoc,
        productsDoc,
        customersSnapshot,
        categoriesSnapshot,
        usersSnapshot
      ] = await Promise.all([
        getDoc(doc(db, "priceData", "4OhZCKHQls64bokVqGN5")),
        getDoc(doc(db, "productData", "zzeEfRyePYTdWemfHHWH")),
        getDocs(collection(db, "customerData")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "users"))
      ]);
      const fetchEndTime = window.performance.now();
      console.log('Data fetch completed in:', fetchEndTime - fetchStartTime, 'ms');

      const processStartTime = window.performance.now();
      
      // Process price data
      if (priceDoc.exists()) {
        setPriceData(priceDoc.data());
        setPriceUpdateTime(new Date(priceDoc.data().timestamp?.toDate()).toLocaleString() || "N/A");
      }

      // Process products
      if (productsDoc.exists()) {
        setProducts(productsDoc.data().products || []);
      }

      // Process customers
      const customersList = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CustomerData));
      setCustomers(customersList);

      // Process categories
      const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category);
      setCategories(categoriesList);
      
      const main = categoriesList.filter(cat => !cat.parentId).length;
      const sub = categoriesList.length - main;
      setMainCategories(main);
      setSubCategories(sub);

      // Process users
      setTotalUsers(usersSnapshot.size);

      const processEndTime = window.performance.now();
      console.log('Data processing completed in:', processEndTime - processStartTime, 'ms');

      const totalTime = window.performance.now() - startTime;
      console.log('Total initialization time:', totalTime, 'ms');
      
      setPerformanceMetrics({
        totalLoadTime: totalTime,
        dataFetchTime: fetchEndTime - fetchStartTime,
        renderTime: 0, // Will be updated in the effect
        initializationTime: processEndTime - processStartTime
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data");
    }
  };

  // Add performance monitoring effect
  useEffect(() => {
    const renderStart = window.performance.now();
    performanceRef.current.renderStart = renderStart;

    return () => {
      const renderTime = window.performance.now() - renderStart;
      const totalTime = window.performance.now() - performanceRef.current.startTime;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime,
        totalLoadTime: totalTime
      }));

      console.log('Performance Metrics:', {
        totalLoadTime: totalTime.toFixed(2) + 'ms',
        dataFetchTime: performanceMetrics.dataFetchTime.toFixed(2) + 'ms',
        renderTime: renderTime.toFixed(2) + 'ms',
        initializationTime: performanceMetrics.initializationTime.toFixed(2) + 'ms'
      });
    };
  }, []);

  // Add performance metrics display component
  const renderPerformanceMetrics = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="fixed bottom-4 right-4 bg-white/80 text-white p-4 rounded-lg text-sm z-50">
          {/* <h3 className="font-bold mb-2">Performance Metrics</h3>
          <div>Total Load: {performanceMetrics.totalLoadTime.toFixed(2)}ms</div>
          <div>Data Fetch: {performanceMetrics.dataFetchTime.toFixed(2)}ms</div>
          <div>Render: {performanceMetrics.renderTime.toFixed(2)}ms</div>
          <div>Init: {performanceMetrics.initializationTime.toFixed(2)}ms</div> */}
        </div>
      );
    }
    return null;
  };

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

        await fetchData();

        // Start automated notifications
        automatedNotificationService.startProductNotifications();
        automatedNotificationService.startPromotionNotifications();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data");
      }
    });

    return () => {
      unsubscribe();
      // Stop automated notifications when component unmounts
      automatedNotificationService.stopNotifications();
    };
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
      description: "Active registered users",
      onClick: () => setActiveSection('dashboard')
    },
    {
      title: "New Orders",
      value: 0,
      color: "bg-[#7E69AB]",
      icon: ShoppingBag,
      link: "#orders",
      description: "Orders pending processing",
      onClick: () => setActiveSection('dashboard')
    },
    {
      title: "Delivered Orders",
      value: 0,
      color: "bg-[#D6BCFA]",
      icon: Package,
      link: "#delivered",
      description: "Successfully delivered",
      onClick: () => setActiveSection('dashboard')
    },
    {
      title: "Reviews",
      value: 0,
      color: "bg-[#1A1F2C]",
      icon: Star,
      link: "#reviews",
      description: "Customer feedback",
      onClick: () => setActiveSection('dashboard')
    },
    {
      title: "Pending Enquiries",
      value: 0,
      color: "bg-[#8E9196]",
      icon: MessageSquare,
      link: "#enquiries",
      description: "Awaiting response",
      onClick: () => setActiveSection('dashboard')
    },
    {
      title: "New Reports",
      value: 0,
      color: "bg-[#8E9196]",
      icon: BarChart3,
      link: "reports",
      description: "View product analytics and reports",
      onClick: () => setActiveSection('reports')
    },
    {
      title: "Categories",
      value: categories.length,
      color: "bg-[#7E69AB]",
      icon: FolderTree,
      link: "categories",
      description: `${mainCategories} main, ${subCategories} sub-categories`,
      onClick: () => setActiveSection('categories')
    }
  ];

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'marketing', label: 'WhatsApp', icon: MessageSquare },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'contact', label: 'Contact', icon: MessageSquare }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {dashboardCards.map((card, index) => (
                <div
                  key={index}
                  className={`${card.color} p-4 sm:p-6 rounded-lg shadow-lg text-white cursor-pointer hover:scale-105 transition-transform duration-200`}
                  onClick={card.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">{card.title}</h3>
                      <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
                    </div>
                    <card.icon className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm opacity-90">{card.description}</p>
                </div>
              ))}
            </div>

            {/* Main Management Sections */}
            <div className="grid grid-cols-12 gap-3 sm:gap-6">
              {/* All Sections in Full Width */}
              <div className="col-span-12 space-y-4 sm:space-y-6">
                {/* Price Management and Live Metal Prices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                  {/* Price Management Card */}
                  <Card className="border border-gray-200 hover:border-primary/50 transition-colors duration-200">
                    <CardHeader className="bg-gray-50">
                      <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                        <Tag className="h-5 w-5 mr-2 text-primary" />
                        Price Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <PriceDisplay priceData={priceData} priceUpdateTime={priceUpdateTime} />
                    </CardContent>
                  </Card>

                  {/* Live Metal Prices Card */}
                  <Card className="border border-gray-200 hover:border-primary/50 transition-colors duration-200">
                    <CardHeader className="bg-gray-50">
                      <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                        Live Metal Prices
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <LiveMetalPrices />
                    </CardContent>
                  </Card>
                </div>

                {/* Update Prices Card */}
                <Card className="border border-gray-200 hover:border-primary/50 transition-colors duration-200">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <Settings className="h-5 w-5 mr-2 text-primary" />
                      Update Prices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <PriceUpdateForm />
                  </CardContent>
                </Card>

                {/* Product Management Card */}
                <Card className="border border-gray-200 hover:border-primary/50 transition-colors duration-200 mb-6">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <Package className="h-5 w-5 mr-2 text-primary" />
                      Product Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ProductForm />
                  </CardContent>
                </Card>

                {/* Promotions Card */}
                <Card className="border border-gray-200 hover:border-primary/50 transition-colors duration-200 mb-6">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <Tag className="h-5 w-5 mr-2 text-primary" />
                      Promotions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <PromotionForm products={products} />
                  </CardContent>
                </Card>

                {/* Gallery Management Card */}
                <Card className="border border-gray-200 hover:border-primary/50 transition-colors duration-200 mb-6">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <Image className="h-5 w-5 mr-2 text-primary" />
                      Gallery Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <AddImage />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return <DashboardAnalytics />;
      case 'inventory':
        return <InventoryManagement />;
      case 'marketing':
        return <WhatsAppDashboard />;
      case 'customers':
        return <CustomerSegments />;
      case 'reports':
        return (
          <div className="space-y-6">
            {/* Product Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{categories.length}</div>
                  <p className="text-sm text-gray-500">Active product categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">2</div>
                  <p className="text-sm text-gray-500">Gold and Silver</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{products.length}</div>
                  <p className="text-sm text-gray-500">Active products</p>
                </CardContent>
              </Card>
            </div>

            {/* Product Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Products by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <DoughnutChart
                    data={{
                      labels: ['Necklaces', 'Rings', 'Earrings', 'Bangles'],
                      datasets: [{
                        data: [30, 25, 25, 20],
                        backgroundColor: [
                          'rgba(75, 192, 192, 0.8)',
                          'rgba(153, 102, 255, 0.8)',
                          'rgba(255, 159, 64, 0.8)',
                          'rgba(255, 99, 132, 0.8)'
                        ]
                      }]
                    }}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Products by Material</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <DoughnutChart
                    data={{
                      labels: ['Gold', 'Silver'],
                      datasets: [{
                        data: [65, 35],
                        backgroundColor: [
                          'rgba(255, 206, 86, 0.8)',
                          'rgba(156, 163, 175, 0.8)'
                        ]
                      }]
                    }}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Products by Purity</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <DoughnutChart
                    data={{
                      labels: ['18K', '22K', '24K', 'Silver 925'],
                      datasets: [{
                        data: [20, 40, 10, 30],
                        backgroundColor: [
                          'rgba(255, 159, 64, 0.8)',
                          'rgba(255, 206, 86, 0.8)',
                          'rgba(255, 99, 132, 0.8)',
                          'rgba(156, 163, 175, 0.8)'
                        ]
                      }]
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Current Analytics & Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Product Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>View detailed sales analytics and trends</p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm">Generate Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Analyze product-wise performance metrics</p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm">Generate Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Review customer behavior and preferences</p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm">Generate Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'categories':
        return (
          <div className="space-y-6">
            <CategoryManagement />
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6">
            {/* Contact Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {contactStats?.inquiryStats?.byStatus?.new || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {contactStats?.appointmentStats?.byStatus?.pending || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Custom Design Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {contactStats?.inquiryStats?.byType?.custom_design || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Needs attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {contactStats?.responseRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg response: {Math.round((contactStats?.averageResponseTime || 0) / (1000 * 60 * 60))}h
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Inquiry Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Inquiries</span>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingContact ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : inquiries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No inquiries found
                          </TableCell>
                        </TableRow>
                      ) : (
                        inquiries.map((inquiry) => (
                          <TableRow key={inquiry.id}>
                            <TableCell>
                              {new Date(inquiry.createdAt.seconds * 1000).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{inquiry.firstName} {inquiry.lastName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {inquiry.inquiryType.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={inquiry.status}
                                onValueChange={(value) => 
                                  handleUpdateInquiryStatus(inquiry.id!, value as ContactInquiry['status'])
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">View</Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Inquiry Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Name</Label>
                                          <p className="text-sm">{inquiry.firstName} {inquiry.lastName}</p>
                                        </div>
                                        <div>
                                          <Label>Contact</Label>
                                          <p className="text-sm">
                                            Email: {inquiry.email}<br />
                                            Phone: {inquiry.phone}
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Message</Label>
                                        <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                                      </div>
                                      {inquiry.imageUrl && (
                                        <div>
                                          <Label>Custom Design Image</Label>
                                          <img src={inquiry.imageUrl} alt="Custom Design" className="mt-2 max-h-48 rounded" />
                                        </div>
                                      )}
                                      {inquiry.preferredMetal && (
                                        <div>
                                          <Label>Preferred Metal</Label>
                                          <p className="text-sm">{inquiry.preferredMetal}</p>
                                        </div>
                                      )}
                                      {inquiry.budgetRange && (
                                        <div>
                                          <Label>Budget Range</Label>
                                          <p className="text-sm">{inquiry.budgetRange}</p>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">Reply</Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reply to Inquiry</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Customer Message</Label>
                                        <p className="text-sm whitespace-pre-wrap border rounded-md p-3 bg-gray-50">{inquiry.message}</p>
                                      </div>
                                      <div className="flex justify-end">
                                        <Button
                                          onClick={async () => {
                                            if (inquiry.phone) {
                                              window.open(`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`, '_blank');
                                              // Update status to completed after opening WhatsApp
                                              await handleUpdateInquiryStatus(inquiry.id!, 'completed');
                                            } else {
                                              toast.error('No phone number available');
                                            }
                                          }}
                                        >
                                          Reply on WhatsApp
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
                                      try {
                                        await deleteDoc(doc(db, 'inquiries', inquiry.id!));
                                        toast.success('Inquiry deleted successfully');
                                        fetchContactData();
                                      } catch (error) {
                                        console.error('Error deleting inquiry:', error);
                                        toast.error('Failed to delete inquiry');
                                      }
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Management */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Upcoming Appointments</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Schedule New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule New Appointment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Select Customer</Label>
                            <Select value={selectedCustomerId} onValueChange={(value) => {
                              setSelectedCustomerId(value);
                              const selectedInquiry = inquiries.find(inq => inq.id === value);
                              if (selectedInquiry) {
                                // Set the appointment date if available
                                const appointmentDateInput = document.getElementById('appointment-date') as HTMLInputElement;
                                if (appointmentDateInput) {
                                  if (selectedInquiry.appointmentDate) {
                                    const date = new Date(selectedInquiry.appointmentDate.seconds * 1000);
                                    appointmentDateInput.value = date.toISOString().slice(0, 16);
                                  } else {
                                    appointmentDateInput.value = '';
                                  }
                                }
                                
                                // Set the appointment type based on inquiry type
                                let appointmentType = 'consultation';
                                if (selectedInquiry.inquiryType === 'custom_design') {
                                  appointmentType = 'custom_design';
                                } else if (selectedInquiry.inquiryType === 'bulk_order') {
                                  appointmentType = 'bulk_order';
                                }
                                setSelectedAppointmentType(appointmentType);
                              }
                            }}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {inquiries.map((inquiry) => (
                                    <SelectItem key={inquiry.id} value={inquiry.id || ''}>
                                      {inquiry.firstName} {inquiry.lastName} - {inquiry.phone || inquiry.email}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Appointment Date & Time</Label>
                            <Input 
                              type="datetime-local" 
                              id="appointment-date" 
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                          <div>
                            <Label>Appointment Type</Label>
                            <Select value={selectedAppointmentType} onValueChange={setSelectedAppointmentType}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select appointment type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="consultation">Consultation</SelectItem>
                                  <SelectItem value="custom_design">Custom Design</SelectItem>
                                  <SelectItem value="bulk_order">Bulk Order</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea id="appointment-notes" placeholder="Add any additional notes..." />
                          </div>
                          <Button
                            onClick={handleScheduleAppointment}
                          >
                            Schedule Appointment
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingContact ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : appointments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No appointments found
                            </TableCell>
                          </TableRow>
                        ) : (
                          appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                {new Date(appointment.date.seconds * 1000).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const relatedInquiry = inquiries.find(i => i.id === appointment.customerId);
                                  if (appointment.customerName) {
                                    return appointment.customerName;
                                  } else if (relatedInquiry) {
                                    return `${relatedInquiry.firstName} ${relatedInquiry.lastName}`;
                                  } else {
                                    return 'Unknown';
                                  }
                                })()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {appointment.type.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={appointment.status}
                                  onValueChange={(value) =>
                                    handleUpdateAppointmentStatus(
                                      appointment.id!,
                                      value as AppointmentRequest['status']
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">View</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Appointment Details</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Date & Time</Label>
                                            <p className="text-sm">
                                              {new Date(appointment.date.seconds * 1000).toLocaleString()}
                                            </p>
                                          </div>
                                          <div>
                                            <Label>Type</Label>
                                            <p className="text-sm">{appointment.type}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <Label>Notes</Label>
                                          <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
                                        </div>
                                        <div>
                                          <Label>Status</Label>
                                          <Badge variant="outline">{appointment.status}</Badge>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">Reschedule</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Reschedule Appointment</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>New Date & Time</Label>
                                          <Input 
                                            type="datetime-local" 
                                            id={`reschedule-date-${appointment.id}`}
                                            min={new Date().toISOString().slice(0, 16)}
                                          />
                                        </div>
                                        <div>
                                          <Label>Notes</Label>
                                          <Textarea 
                                            id={`reschedule-notes-${appointment.id}`}
                                            placeholder="Add any notes about rescheduling..."
                                          />
                                        </div>
                                        <Button onClick={async () => {
                                          const newDate = (document.getElementById(`reschedule-date-${appointment.id}`) as HTMLInputElement)?.value;
                                          const notes = (document.getElementById(`reschedule-notes-${appointment.id}`) as HTMLTextAreaElement)?.value;
                                          
                                          if (!newDate) {
                                            toast.error('Please select a new date and time');
                                            return;
                                          }

                                          try {
                                            await updateDoc(doc(db, 'appointments', appointment.id!), {
                                              date: Timestamp.fromDate(new Date(newDate)),
                                              notes: notes || appointment.notes,
                                              updatedAt: Timestamp.now()
                                            });
                                            toast.success('Appointment rescheduled successfully');
                                            fetchContactData();
                                          } catch (error) {
                                            console.error('Error rescheduling appointment:', error);
                                            toast.error('Failed to reschedule appointment');
                                          }
                                        }}>
                                          Confirm Reschedule
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={async () => {
                                      if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
                                        try {
                                          await deleteDoc(doc(db, 'appointments', appointment.id!));
                                          toast.success('Appointment deleted successfully');
                                          fetchContactData();
                                        } catch (error) {
                                          console.error('Error deleting appointment:', error);
                                          toast.error('Failed to delete appointment');
                                        }
                                      }
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const handleEditCategory = async (category: Category) => {
    setSelectedCategory(category);
    setIsAddingCategory(true);
  };

  const handleAddCategory = async (data: NewCategory) => {
    setIsSubmitting(true);
    try {
      const timestamp = serverTimestamp();
      // Clean and prepare the data before saving
      const categoryToSave = {
        name: data.name,
        slug: slugify(data.name),
        parentId: data.parentId || null,
        level: data.parentId ? 2 : 1,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? categories.length + 1,
        path: data.parentId 
          ? `${categories.find(c => c.id === data.parentId)?.name || ''} > ${data.name}`
          : data.name,
        hasChildren: false,
        showInHeader: data.showInHeader ?? false,
        createdAt: timestamp,
        updatedAt: timestamp,
        attributes: data.attributes.map(attr => ({
          id: attr.id,
          name: attr.name,
          type: attr.type,
          required: attr.required ?? false,
          options: attr.options || [],
          unit: attr.unit || ""
        })),
        materialOptions: data.materialOptions.map(mat => ({
          type: mat.type,
          purity: mat.purity || [],
          designOptions: mat.designOptions || [],
          defaultPurity: mat.defaultPurity || mat.purity?.[0] || "",
          defaultDesign: mat.defaultDesign || "Traditional"
        }))
      };

      if (data.id === 'new' || !data.id) {
        // Add new category
        await addDoc(collection(db, 'categories'), categoryToSave);
        toast.success('Category added successfully');
      } else {
        // Update existing category
        const { createdAt, ...updateData } = categoryToSave;
        await updateDoc(doc(db, 'categories', data.id), updateData);
        toast.success('Category updated successfully');
      }

      setIsAddingCategory(false);
      setSelectedCategory(null);
      await fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkToggleActive = async (setActive: boolean) => {
    if (selectedIds.size === 0) return;
    
    try {
      const batch = writeBatch(db);
      Array.from(selectedIds).forEach(id => {
        const docRef = doc(db, 'categories', id);
        batch.update(docRef, { 
          isActive: setActive,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      toast.success(`Categories ${setActive ? 'activated' : 'deactivated'} successfully`);
      setSelectedIds(new Set<string>());
      await fetchData();
    } catch (error) {
      console.error('Error updating categories:', error);
      toast.error(`Failed to ${setActive ? 'activate' : 'deactivate'} categories`);
    }
  };

  const toggleSelection = (categoryId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSuggestedCategoryClick = async (suggestedCategory: typeof defaultSuggestedCategories[0]) => {
    const isDuplicate = categories.some(existingCat => {
      const normalizedExisting = existingCat.name.toLowerCase().trim();
      const normalizedNew = suggestedCategory.name.toLowerCase().trim();
      return normalizedExisting === normalizedNew;
    });
    
    if (isDuplicate) {
      toast.error(`A category with name "${suggestedCategory.name}" already exists`);
      return;
    }

    const newCategoryData = {
      name: suggestedCategory.name,
      slug: slugify(suggestedCategory.name),
      parentId: null,
      level: 1,
      isActive: true,
      sortOrder: categories.length + 1,
      path: suggestedCategory.name,
      hasChildren: false,
      showInHeader: false,
      attributes: suggestedCategory.attributes.map(attr => ({
        id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: attr.name,
        type: attr.type,
        required: attr.required,
        options: attr.options || [],
        unit: attr.unit || ""
      })),
      materialOptions: [
        {
          type: "Gold",
          purity: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
          designOptions: [
            "Antique",
            "Kundan",
            "Meenakari",
            "Jadau",
            "Temple",
            "Modern",
            "Gemstone",
            "Traditional",
            "Fancy"
          ],
          defaultPurity: "22 Karat",
          defaultDesign: "Traditional"
        }
      ]
    };

    try {
      await handleAddCategory(newCategoryData);
      toast.success(`${suggestedCategory.name} category created successfully`);
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(`Failed to create ${suggestedCategory.name} category. Please try again.`);
    }
  };

  // Add this effect to fetch contact data
  useEffect(() => {
    if (activeSection === 'contact') {
      fetchContactData();
    }
  }, [activeSection]);

  const fetchContactData = async () => {
    setIsLoadingContact(true);
    try {
      const [inquiriesData, appointmentsData, analyticsData] = await Promise.all([
        contactService.getInquiries(),
        contactService.getAppointments(),
        contactService.getContactAnalytics(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date()
        )
      ]);

      // Process inquiries to ensure all required fields are present
      const processedInquiries = inquiriesData.map(inquiry => ({
        ...inquiry,
        id: inquiry.id || '',
        status: inquiry.status || 'new',
        priority: inquiry.priority || 'medium',
        inquiryType: inquiry.inquiryType as ContactInquiryType,
        createdAt: inquiry.createdAt || Timestamp.now(),
        updatedAt: inquiry.updatedAt || Timestamp.now(),
        appointmentDate: inquiry.appointmentDate || null
      })) as ContactInquiry[];

      // Process appointments to ensure all required fields
      const processedAppointments = appointmentsData.map(appointment => ({
        ...appointment,
        id: appointment.id || '',
        status: appointment.status || 'pending',
        createdAt: appointment.createdAt || Timestamp.now()
      }));

      setInquiries(processedInquiries);
      setAppointments(processedAppointments);
      setContactStats(analyticsData);
    } catch (error) {
      console.error('Error fetching contact data:', error);
      toast.error('Failed to load contact data');
    } finally {
      setIsLoadingContact(false);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, status: ContactInquiry['status']) => {
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        status,
        updatedAt: Timestamp.now()
      });
      toast.success('Inquiry status updated');
      fetchContactData();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast.error('Failed to update inquiry status');
    }
  };

  const handleUpdateAppointmentStatus = async (
    appointmentId: string,
    status: AppointmentRequest['status'],
    notes?: string
  ) => {
    try {
      await contactService.updateAppointmentStatus(appointmentId, status, notes);
      toast.success('Appointment status updated');
      fetchContactData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  // Add this function to handle inquiry responses
  const handleInquiryResponse = async (inquiryId: string, response: string) => {
    try {
      // First update the inquiry status
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        status: 'completed',
        updatedAt: Timestamp.now()
      });

      // Then record the response
      await addDoc(collection(db, 'inquiryResponses'), {
        inquiryId,
        response,
        timestamp: Timestamp.now()
      });

      toast.success('Response sent successfully');
      fetchContactData(); // Refresh the data
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    }
  };

  // Update handleScheduleAppointment function
  const handleScheduleAppointment = async () => {
    try {
      if (!selectedCustomerId) {
        toast.error('Please select a customer');
        return;
      }

      const appointmentDate = (document.getElementById('appointment-date') as HTMLInputElement)?.value;
      const notes = (document.getElementById('appointment-notes') as HTMLTextAreaElement)?.value;

      if (!appointmentDate) {
        toast.error('Please select an appointment date and time');
        return;
      }

      // Find the selected inquiry
      const selectedInquiry = inquiries.find(inq => inq.id === selectedCustomerId);
      if (!selectedInquiry) {
        toast.error('Selected customer not found');
        return;
      }

      // Create the appointment directly in Firestore
      const appointmentData = {
        customerId: selectedCustomerId,
        customerName: `${selectedInquiry.firstName} ${selectedInquiry.lastName}`,
        customerContact: selectedInquiry.phone || selectedInquiry.email,
        date: Timestamp.fromDate(new Date(appointmentDate)),
        type: selectedAppointmentType,
        notes: notes || '',
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Add the appointment to Firestore
      await addDoc(collection(db, 'appointments'), appointmentData);

      // Update the inquiry status
      await updateDoc(doc(db, 'inquiries', selectedCustomerId), {
        status: 'completed',
        updatedAt: Timestamp.now()
      });

      toast.success('Appointment scheduled successfully');
      fetchContactData(); // Refresh the data
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-10">
        {/* Main Header */}
        <div className="bg-white shadow-sm sticky top-16 z-20">
        <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                Hello 👋 {userData?.firstName} {userData?.lastName}
              </h1>
            </div>

              <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
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
                  <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogTrigger asChild>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Profile Image URL</Label>
                          <Input
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                          />
                        </div>
                        <Button onClick={updateProfile}>Save Changes</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenuItem onClick={() => auth.signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Admin Page Header */}
          <div className="">
        {/* Horizontal Navigation */}
            <nav className="bg-white sticky top-[120px] sm:top-[132px] z-20 -mx-2 px-2 flex overflow-x-auto scrollbar-hide border-b border-gray-200">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
                  className={`py-2 px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                    activeSection === item.id ? 'border-b-2 border-primary' : ''
                  }`}
              onClick={() => setActiveSection(item.id as Section)}
            >
                  <item.icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Dynamic Section Content */}
            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
          {renderContent()}
            </div>
          </div>
        </div>
      </div>
      {renderPerformanceMetrics()}
    </div>
  );
};

export default Admin;
