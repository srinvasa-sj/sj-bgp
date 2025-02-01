import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Cart } from "./Cart";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;