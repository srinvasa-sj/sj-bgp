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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<string | null>(null);
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

  // Add click handlers for mobile menu
  const handleMobileMenuClick = (menuId: string) => {
    setMobileMenuOpen(prevMenu => {
      // If clicking the same menu that's open, close it
      if (prevMenu === menuId) {
        setMobileSubMenuOpen(null); // Also close submenu
        return null;
      }
      // If clicking a different menu, open it and close others
      setMobileSubMenuOpen(null);
      return menuId;
    });
  };

  const handleMobileSubMenuClick = (menuId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileSubMenuOpen(prevMenu => prevMenu === menuId ? null : menuId);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(null);
        setMobileSubMenuOpen(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 bg-transparent backdrop-blur-lg shadow-md border-b-[3px] border-[#FFD700] lg:pl-72 transition-all overflow-visible">
      <div className="flex flex-col lg:flex-row lg:items-center h-auto px-2 py-1 lg:py-1">
        {/* Logo and Mobile Menu */}
        <div className="flex items-center gap-2 w-full lg:w-auto lg:mb-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden hover:bg-[#FFD700]/10 transition-all duration-300"
            >
            <Menu className="h-8 w-8 text-[#0b0c33]" />
            </Button>

            <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full overflow-hidden border-4 border-[#FFD700] shadow-lg ring-2 ring-[#FFD700]/30">
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

          {/* Mobile Categories and Search */}
          <div className="lg:hidden flex-1 overflow-x-auto mobile-menu-container relative">
            <div className="flex items-center gap-2 min-w-max pr-4 no-scrollbar">
              {/* All Jewellery Menu */}
              <div className="relative flex-shrink-0">
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-1 hover:bg-[#FFD700]/10 whitespace-nowrap"
                  onClick={() => handleMobileMenuClick('allJewellery')}
                >
                  <span>All Jewellery</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileMenuOpen === 'allJewellery' ? 'rotate-180' : ''}`} />
                </Button>
                
                {/* Main Menu - Mobile Dropdown */}
                {mobileMenuOpen === 'allJewellery' && (
                  <div 
                    className="fixed left-2 top-[4rem] w-[280px] bg-white shadow-lg border border-gray-200 py-2 z-[9999] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2">
                      {mainCategories.map((category) => {
                        const subcategories = getSubcategories(category.id);
                        
                        if (subcategories.length > 0) {
                          return (
                            <div key={category.id} className="relative">
                              <button 
                                className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleMobileSubMenuClick(category.id, e);
                                }}
                              >
                                <span>{category.name}</span>
                                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${mobileSubMenuOpen === category.id ? 'rotate-90' : ''}`} />
                              </button>
                              
                              {/* Submenu - Positioned for mobile */}
                              {mobileSubMenuOpen === category.id && (
                                <div 
                                  className="bg-gray-50 w-full border-t border-gray-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {subcategories.map((subcat) => (
                                    <button
                                      key={subcat.id}
                                      className="w-full px-8 py-2 text-left hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCategoryClick(subcat.name);
                                        setMobileMenuOpen(null);
                                        setMobileSubMenuOpen(null);
                                      }}
                                    >
                                      {subcat.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        return (
                          <button
                            key={category.id}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCategoryClick(category.name);
                              setMobileMenuOpen(null);
                            }}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                      
                      <div className="h-px bg-gray-200 my-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Category Pills with Dropdowns */}
              <div className="flex space-x-2 flex-nowrap">
                {headerCategories.map((category) => (
                  <div key={category.id} className="relative">
                    <button
                      onClick={() => handleMobileMenuClick(category.id)}
                      className={`whitespace-nowrap px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${
                        selectedCategory === category.name
                          ? "bg-[#9b87f5] text-black hover:bg-[#cae630]"
                          : "text-[#040208] hover:bg-[#b2ce35]"
                      }`}
                    >
                      {category.name}
                      {getSubcategories(category.id).length > 0 && (
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${mobileMenuOpen === category.id ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {/* Mobile Category Dropdown */}
                    {getSubcategories(category.id).length > 0 && mobileMenuOpen === category.id && (
                      <div 
                        className="fixed left-2 top-[4rem] w-[280px] bg-white shadow-lg border border-gray-200 py-2 z-[9999] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-2">
                          {getSubcategories(category.id).map((subcat) => (
                            <button
                              key={subcat.id}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCategoryClick(subcat.name);
                                setMobileMenuOpen(null);
                              }}
                            >
                              {subcat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex-shrink-0 ml-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-10 w-[200px] py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700]"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Desktop Categories and Search */}
        <div className="hidden lg:flex flex-grow lg:flex-row lg:items-center lg:space-x-4 lg:ml-6 overflow-visible">
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
            </div>
          </div>

          {/* Category Pills with Hover Dropdowns */}
          <div className="flex space-x-2 overflow-visible">
            {headerCategories.map((category) => (
              <div key={category.id} className="relative group/pill">
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className={`whitespace-nowrap px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${selectedCategory === category.name
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

          {/* Search Form */}
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


