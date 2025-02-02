import { Menu, X, LogIn, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { Cart } from "./Cart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setUserRole(data.role);
        }
      }
    };

    getUserRole();
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-2xl font-semibold tracking-tight">
            LCART
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/products" className="text-foreground/80 hover:text-foreground transition-colors">
              Products
            </a>
            <a href="/categories" className="text-foreground/80 hover:text-foreground transition-colors">
              Categories
            </a>
            <a href="/about" className="text-foreground/80 hover:text-foreground transition-colors">
              About
            </a>
            <Cart />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild>
                      <a href="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <a href="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </a>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              <a href="/products" className="text-foreground/80 hover:text-foreground transition-colors">
                Products
              </a>
              <a href="/categories" className="text-foreground/80 hover:text-foreground transition-colors">
                Categories
              </a>
              <a href="/about" className="text-foreground/80 hover:text-foreground transition-colors">
                About
              </a>
              <Cart />
              {user ? (
                <>
                  {userRole === 'admin' && (
                    <a href="/admin" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </a>
                  )}
                  <Button variant="ghost" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="ghost" asChild>
                  <a href="/auth">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;