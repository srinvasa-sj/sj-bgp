import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    "Earrings", "Necklaces", "Rings", "Bracelets",
    "Bangles", "Anklets", "Men's Jewellery", "Kid's Jewellery"
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    const search = params.get("search");

    // Set category and search query when URL changes
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("all");
    }

    // If search query exists in the URL, set it in the state
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery(""); // Clear searchQuery if no search param
    }
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams(location.search);

    // Handle search query and update the URL accordingly
    if (searchQuery.trim()) {
      searchParams.set("search", searchQuery.trim());
    } else {
      searchParams.delete("search"); // Remove search if query is cleared
    }

    // Handle category selection and update the URL accordingly
    if (selectedCategory !== "all") {
      searchParams.set("category", selectedCategory);
    } else {
      searchParams.delete("category"); // Remove category filter if 'all'
    }

    navigate(`/products?${searchParams.toString()}`);
  };

  const handleCategoryClick = (category: string) => {
    const searchParams = new URLSearchParams(location.search);
    if (category === selectedCategory) {
      searchParams.delete("category");
      setSelectedCategory("all");
    } else {
      searchParams.set("category", category);
      setSelectedCategory(category);
    }
    navigate(`/products?${searchParams.toString()}`);
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-40 bg-transparent backdrop-blur-lg shadow-md border-b-[3px] border-[#FFD700] lg:pl-72 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center h-auto px-4 py-2">
        {/* Logo and Mobile Menu */}
        <div className="flex items-center gap-1 mb-2 lg:mb-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden hover:bg-[#FFD700]/10 transition-all duration-300"
          >
            <Menu className="h-6 w-6 text-[#FFD700]" />
          </Button>

          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-4 border-[#FFD700] shadow-lg ring-2 ring-[#FFD700]/30">
            <img
              src="/uploads/c70fae25-46f4-408e-a132-affaa273167d.png"
              alt="Srinivasa Jewellers"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Mobile Search and Categories */}
        <div className="lg:hidden space-y-2">
          <form onSubmit={handleSearch} className="mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 w-full py-1.5 text-sm rounded-lg border-2 border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`whitespace-nowrap px-2 py-1 text-xs rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-[#9b87f5] text-white hover:bg-[#7E69AB]"
                    : "text-[#6E59A5] hover:bg-[#E5DEFF]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Categories and Search */}
        <div className="hidden lg:flex items-center space-x-4 ml-6 flex-grow">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`whitespace-nowrap px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-[#9b87f5] text-white hover:bg-[#7E69AB]"
                    : "text-[#6E59A5] hover:bg-[#E5DEFF]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search by name, weight, price, purity..."
                className="pl-10 w-full py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;


