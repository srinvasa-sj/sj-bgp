import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Search } from "lucide-react";
import Cart from "./Cart";

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-semibold">
            Store
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="nav-link">
              Products
            </Link>
            <Link to="/categories" className="nav-link">
              Categories
            </Link>
            <Link to="/about" className="nav-link">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <User className="w-5 h-5" />
            </button>
            <button 
              className="p-2 hover:bg-secondary rounded-full transition-colors relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navbar;