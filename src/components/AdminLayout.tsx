
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CustomSidebar } from "@/components/ui/custom-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  BarChart3,
  LucideIcon
} from "lucide-react";

interface SidebarItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      title: "Products",
      icon: Package,
      href: "/admin/products",
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      title: "Users",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <CustomSidebar items={sidebarItems} />
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
