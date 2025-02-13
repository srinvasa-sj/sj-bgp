import { Link, useLocation } from "react-router-dom";
import { Home, Info, Image, ShoppingBag, Phone, Settings, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserData } from "@/types/user"; // Import UserData interface

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarNavigationProps {
  isAdmin: boolean;
  userData: UserData | null;
  onClose: () => void;
}

export const SidebarNavigation = ({ isAdmin, userData, onClose }: SidebarNavigationProps) => {
  const location = useLocation();

  const isCustomer = userData?.role === "Customer";

  const menuItems: NavItem[] = [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About", icon: Info },
    { path: "/gallery", label: "Gallery", icon: Image },
    { path: "/products", label: "Products", icon: ShoppingBag },
    { path: "/contact", label: "Contact", icon: Phone },
    isAdmin
      ? { path: "/admin", label: "Admin", icon: Settings }
      : isCustomer
      ? { path: "/customer-dashboard", label: "Customer", icon: Settings }
      : { path: "/login", label: "Login", icon: LogIn },
  ];

  return (
    <nav className="flex-1 mt-6">
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={cn(
                "flex items-center px-6 py-3 rounded-lg transition-all duration-300",
                "hover:bg-primary/10 hover:scale-105",
                "text-base lg:text-lg", // Reduced from text-xl
                location.pathname === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700"
              )}
              onClick={onClose}
            >
              <item.icon className="h-5 w-5 lg:h-6 lg:w-6 mr-4" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};