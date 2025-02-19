import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster as RadixToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import non-lazy components
import Index from "./pages/Index";
import Home from "./pages/Home";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load routes
const Admin = lazy(() => import("./pages/Admin"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const Reports = lazy(() => import("@/pages/admin/Reports"));
const CategoryManagement = lazy(() => import("@/pages/admin/CategoryManagement"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Configure query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  }
});

// Create router with future flags enabled
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "gallery", element: <Gallery /> },
      { path: "products", element: <Products /> },
      { path: "product/:productName", element: <ProductDetails /> },
      { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      { 
        path: "admin", 
        element: <ProtectedRoute requireAdmin><Admin /></ProtectedRoute> 
      },
      { 
        path: "admin/products", 
        element: <ProtectedRoute requireAdmin><ProductManagement /></ProtectedRoute> 
      },
      { 
        path: "admin/categories", 
        element: <ProtectedRoute requireAdmin><CategoryManagement /></ProtectedRoute> 
      },
      { 
        path: "admin/reports", 
        element: <ProtectedRoute requireAdmin><Reports /></ProtectedRoute> 
      },
      { 
        path: "customer-dashboard", 
        element: <ProtectedRoute><CustomerDashboard /></ProtectedRoute> 
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <RouterProvider router={router} />
          </Suspense>
          <RadixToaster />
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            expand
            visibleToasts={3}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
