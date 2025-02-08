// import { Search, Menu } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";

// interface HeaderProps {
//   toggleSidebar: () => void;
// }

// const Header = ({ toggleSidebar }: HeaderProps) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const navigate = useNavigate();

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
//     }
//   };

//   return (
//     <header className="fixed top-0 right-0 left-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm border-b-2 border-[#FFD700] lg:pl-72">
//       <div className="h-16 px-4 flex items-center justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={toggleSidebar}
//             className="lg:hidden hover:bg-primary/10 transition-colors"
//           >
//             <Menu className="h-6 w-6" />
//           </Button>
//           <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFD700] pointer-events-none">
//             <img 
//               src="/uploads/c70fae25-46f4-408e-a132-affaa273167d.png" 
//               alt="Srinivas Jewellers" 
//               className="w-full h-full object-cover"
//             />
//           </div>
//         </div>
        
//         <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               type="search"
//               placeholder="Search products..."
//               className="pl-10 w-full hover:border-primary focus:border-primary transition-colors"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </form>
//       </div>
//     </header>
//   );
// };

// export default Header;

import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-40 bg-transparent backdrop-blur-lg shadow-md border-b-[3px] border-[#FFD700] lg:pl-72 transition-all">
      <div className="h-16 px-6 flex items-center justify-between gap-6">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden hover:bg-[#FFD700]/10 transition-all duration-300"
          >
            <Menu className="h-7 w-7 text-[#FFD700]" />
          </Button>

          {/* Logo */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-[#FFD700] shadow-lg ring-2 ring-[#FFD700]/30">
            <img 
              src="/uploads/c70fae25-46f4-408e-a132-affaa273167d.png" 
              alt="Srinivasa Jewellers" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-12 w-full py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring-[#FFD700] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        
      </div>
    </header>
  );
};

export default Header;
