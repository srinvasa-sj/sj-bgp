// import { Search, Menu } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Button } from "@/components/ui/button";

// interface HeaderProps {
//   toggleSidebar: () => void;
// }

// const Header = ({ toggleSidebar }: HeaderProps) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const navigate = useNavigate();
//   const location = useLocation();

//   const categories = [
//     "Earrings", "Necklaces", "Rings", "Bracelets",
//     "Bangles", "Anklets", "Men's Jewellery", "Kid's Jewellery"
//   ];

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const category = params.get("category");
//     const search = params.get("search");

//     // Set category and search query when URL changes
//     if (category) {
//       setSelectedCategory(category);
//     } else {
//       setSelectedCategory("all");
//     }

//     // If search query exists in the URL, set it in the state
//     if (search) {
//       setSearchQuery(search);
//     } else {
//       setSearchQuery(""); // Clear searchQuery if no search param
//     }
//   }, [location]);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     const searchParams = new URLSearchParams(location.search);

//     // Handle search query and update the URL accordingly
//     if (searchQuery.trim()) {
//       searchParams.set("search", searchQuery.trim());
//     } else {
//       searchParams.delete("search"); // Remove search if query is cleared
//     }

//     // Handle category selection and update the URL accordingly
//     if (selectedCategory !== "all") {
//       searchParams.set("category", selectedCategory);
//     } else {
//       searchParams.delete("category"); // Remove category filter if 'all'
//     }

//     navigate(`/products?${searchParams.toString()}`);
//   };

//   const handleCategoryClick = (category: string) => {
//     const searchParams = new URLSearchParams(location.search);
//     if (category === selectedCategory) {
//       searchParams.delete("category");
//       setSelectedCategory("all");
//     } else {
//       searchParams.set("category", category);
//       setSelectedCategory(category);
//     }
//     navigate(`/products?${searchParams.toString()}`);
//   };

//   return (
//     <header className="fixed top-0 right-0 left-0 z-40 bg-transparent backdrop-blur-lg shadow-md border-b-[3px] border-[#FFD700] lg:pl-72 transition-all">
//       <div className="flex flex-col lg:flex-row lg:items-center h-auto px-4 py-2">
//         {/* Logo and Mobile Menu */}
//         <div className="flex items-center gap-1 mb-2 lg:mb-0">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={toggleSidebar}
//             className="lg:hidden hover:bg-[#FFD700]/10 transition-all duration-300"
//           >
//             <Menu className="h-10 w-10 text-[#0b0c33]" />
//           </Button>

//           <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-4 border-[#FFD700] shadow-lg ring-2 ring-[#FFD700]/30">
//             <img
//               src="/uploads/c70fae25-46f4-408e-a132-affaa273167d.png"
//               alt="Srinivasa Jewellers"
//               className="w-full h-full object-cover"
//             />
//           </div>
//         </div>

//         {/* Mobile Search and Categories */}
//         <div className="lg:hidden space-y-2">
//           <form onSubmit={handleSearch} className="mb-2">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
//               <Input
//                 type="search"
//                 placeholder="Search products..."
//                 className="pl-10 w-full py-1.5  text-sm rounded-lg border-2 border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700]"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//           </form>

//           <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => handleCategoryClick(category)}
//                 className={`whitespace-nowrap px-2 py-1 text-xs rounded-full transition-colors ${
//                   selectedCategory === category
//                     ? "bg-[#9b87f5] text-black hover:bg-[#cae630]"
//                     : "text-[#040208] hover:bg-[#b2ce35]"
//                 }`}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Desktop Categories and Search */}
//         <div className="hidden lg:flex items-center space-x-4 ml-6 flex-grow">
//           <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => handleCategoryClick(category)}
//                 className={`whitespace-nowrap px-3 py-1 text-sm rounded-full transition-colors ${
//                   selectedCategory === category
//                     ? "bg-[#9b87f5] text-black hover:bg-[#cae630]"
//                     : "text-[#040208] hover:bg-[#b2ce35]"
//                 }`}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>

//           <form onSubmit={handleSearch} className="flex-1 max-w-md ml-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
//               <Input
//                 type="search"
//                 placeholder="Search by name, weight, price, purity..."
//                 className="pl-10 w-full py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700]"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//           </form>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;


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
    } else {
      searchParams.delete("search");
    }

    if (selectedCategory !== "all") {
      searchParams.set("category", selectedCategory);
    } else {
      searchParams.delete("category");
    }

    navigate(`/products?${searchParams.toString()}`);
  };

  const handleCategoryClick = (category: string) => {
    const searchParams = new URLSearchParams(location.search);
    
    // Clear all filters when changing category
    searchParams.delete("material");
    searchParams.delete("design");
    
    if (category === selectedCategory) {
      searchParams.delete("category");
      setSelectedCategory("all");
    } else {
      searchParams.set("category", category);
      setSelectedCategory(category);
    }
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
    <header className="fixed top-0 right-0 left-0 z-40 bg-transparent backdrop-blur-lg shadow-md border-b-[3px] border-[#FFD700] lg:pl-72 transition-all overflow-visible">
      <div className="flex flex-col lg:flex-row lg:items-center h-auto px-4 py-2 overflow-visible">
        {/* Logo and Mobile Menu */}
        <div className="flex items-center gap-1 mb-2 lg:mb-0">
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

        {/* Categories and Search */}
        <div className="flex-grow flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4 lg:ml-6 overflow-visible">
          {/* All Jewellery Hover Menu */}
          <div className="relative group">
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
                        <button 
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleCategoryClick(category.name)}
                        >
                          All {category.name}
                        </button>
                        <div className="h-px bg-gray-200 my-1" />
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
          <div className="flex space-x-2 overflow-visible">
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
                    <button 
                      className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-100"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <span>All {category.name}</span>
                    </button>
                    
                    <div className="h-px bg-gray-200 my-1" />
                    
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
                            <button 
                              className="w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={() => handleCategoryClick(subcat.name)}
                            >
                              All {subcat.name}
                            </button>
                            <div className="h-px bg-gray-200 my-1" />
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
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
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


