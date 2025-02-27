import { Search, Menu, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types/category";
import { toast } from "sonner";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, orderBy("sortOrder"));
      const querySnapshot = await getDocs(q);
      const fetchedCategories = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Category[];
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error loading categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    const search = params.get("search");

    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("all");
    }

    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery("");
    }
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams(location.search);

    if (searchQuery.trim()) {
      searchParams.set("search", searchQuery.trim());
      searchParams.set("searchFields", "name,productCategory,subcategory,purity,material,productID,weight,price");
    } else {
      searchParams.delete("search");
      searchParams.delete("searchFields");
    }

    navigate(`/products?${searchParams.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
    if (!newValue.trim()) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete("search");
      searchParams.delete("searchFields");
      navigate(`/products?${searchParams.toString()}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    const searchParams = new URLSearchParams(location.search);
    
    // Find the clicked category in our categories list
    const clickedCategory = categories.find(cat => cat.name === category);
    if (!clickedCategory) return;
    
    // Clear existing category-related parameters
    searchParams.delete("category");
    searchParams.delete("parentCategory");
    searchParams.delete("subCategory");
    searchParams.delete("headerFilter");
    
    if (category === selectedCategory) {
      setSelectedCategory("all");
    } else {
      // If it's a main category, include all its subcategories
      if (!clickedCategory.parentId) {
        searchParams.set("headerCategory", clickedCategory.id);
        searchParams.delete("headerSubCategory");
        // Add a parameter to indicate we want all subcategory products
        searchParams.set("includeSubcategories", "true");
      } else {
        // If it's a subcategory, set both parent and sub (existing behavior)
        const parentCategory = categories.find(cat => cat.id === clickedCategory.parentId);
        if (parentCategory) {
          searchParams.set("headerCategory", parentCategory.id);
          searchParams.set("headerSubCategory", clickedCategory.id);
        }
      }
      searchParams.set("headerFilter", category);
      setSelectedCategory(category);
    }
    
    // Navigate to products page with the new parameters
    navigate(`/products?${searchParams.toString()}`);
  };

  const handleFilterClick = (type: string, value: string) => {
    const searchParams = new URLSearchParams(location.search);
    const currentValue = searchParams.get(type);

    if (type === 'material') {
      searchParams.delete('design');
    } else if (type === 'design') {
      searchParams.delete('material');
    }

    if (currentValue === value) {
      searchParams.delete(type);
    } else {
      searchParams.set(type, value);
    }

    navigate(`/products?${searchParams.toString()}`);
  };

  const isFilterActive = (type: string, value: string) => {
    const params = new URLSearchParams(location.search);
    return params.get(type) === value;
  };

  // Get main categories (no parent)
  const mainCategories = categories
    .filter(cat => !cat.parentId && cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Get subcategories for a parent category
  const getSubcategories = (parentId: string) => {
    return categories
      .filter(cat => cat.parentId === parentId && cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // Filter categories to show in header
  const headerCategories = mainCategories
    .filter(cat => cat.showInHeader)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 bg-transparent backdrop-blur-lg shadow-md border-b-[3px] border-[#FFD700] lg:pl-72 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center h-auto px-4 py-2">
        {/* Logo and Mobile Menu */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-1 mb-2 lg:mb-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden hover:bg-[#FFD700]/10 transition-all duration-300"
            >
              <Menu className="h-10 w-10 text-[#0b0c33]" />
            </Button>

            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-4 border-[#FFD700] shadow-lg ring-2 ring-[#FFD700]/30">
              <img
                src="/uploads/c70fae25-46f4-408e-a132-affaa273167d.jpg"
                alt="Srinivasa Jewellers"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          </div>

          {/* Search Form - Mobile */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[200px] lg:hidden ml-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-full py-1 text-sm rounded-lg border-2 border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        </div>

        {/* Categories and Search for larger screens */}
        <div className="flex-grow flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4 lg:ml-6">
          {/* Categories Scroll Container */}
          <div className="overflow-x-auto whitespace-nowrap flex gap-2 pb-2 scrollbar-hide -mx-4 px-4">
            {/* All Jewellery Hover Menu */}
            <div className="relative group flex-shrink-0">
            <Button 
              variant="ghost" 
              className="flex items-center space-x-1 hover:bg-[#FFD700]/10"
            >
              <span>All Jewellery</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {/* Main Menu */}
            <div className="absolute left-0 top-full hidden group-hover:block min-w-[240px] bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50">
              {mainCategories.map((category) => {
                const subcategories = getSubcategories(category.id);
                
                if (subcategories.length > 0) {
                  return (
                    <div key={category.id} className="relative group/sub">
                      <button 
                        className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-100"
                        onClick={() => handleCategoryClick(category.name)}
                      >
                        <span>{category.name}</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      
                      {/* Submenu */}
                      <div className="absolute left-full top-0 hidden group-hover/sub:block min-w-[200px] bg-white shadow-lg rounded-lg border border-gray-200 py-2">
                        {subcategories.map((subcat) => (
                          <button
                            key={subcat.id}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            onClick={() => handleCategoryClick(subcat.name)}
                          >
                            {subcat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <button
                    key={category.id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    {category.name}
                  </button>
                );
              })}
              
              <div className="h-px bg-gray-200 my-1" />
              
              {/* Material Options */}
              <button 
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                  isFilterActive('material', 'Gold') ? "bg-[#FFD700]/10" : ""
                }`}
                onClick={() => handleFilterClick('material', 'Gold')}
              >
                Gold
              </button>
              <button
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                  isFilterActive('material', 'Silver') ? "bg-[#FFD700]/10" : ""
                }`}
                onClick={() => handleFilterClick('material', 'Silver')}
              >
                Silver
              </button>
            </div>
          </div>

          {/* Category Pills with Hover Dropdowns */}
          <div className="flex space-x-2">
            {headerCategories.map((category) => (
              <div key={category.id} className="relative group/pill">
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className={`whitespace-nowrap px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${
                    selectedCategory === category.name
                    ? "bg-[#9b87f5] text-black hover:bg-[#cae630]"
                    : "text-[#040208] hover:bg-[#b2ce35]"
                  }`}
                >
                  {category.name}
                  {getSubcategories(category.id).length > 0 && (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>

                {getSubcategories(category.id).length > 0 && (
                  <div className="absolute left-0 top-full pt-2 hidden group-hover/pill:block z-[100]">
                    <div className="min-w-[240px] bg-white shadow-lg rounded-lg border border-gray-200 py-2">
                      {getSubcategories(category.id).map((subcat) => (
                        <div key={subcat.id} className="relative group/sub">
                          <button 
                            className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-100"
                            onClick={() => handleCategoryClick(subcat.name)}
                          >
                            <span>{subcat.name}</span>
                            {getSubcategories(subcat.id).length > 0 && (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          
                          {getSubcategories(subcat.id).length > 0 && (
                            <div className="absolute left-full top-0 hidden group-hover/sub:block">
                              <div className="min-w-[200px] bg-white shadow-lg rounded-lg border border-gray-200 py-2 ml-2">
                                {getSubcategories(subcat.id).map((thirdLevel) => (
                                  <button
                                    key={thirdLevel.id}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                    onClick={() => handleCategoryClick(thirdLevel.name)}
                                  >
                                    {thirdLevel.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>

          {/* Search Form - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search by name, category, purity, material, ID, weight, price..."
                className="pl-10 w-full py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;


