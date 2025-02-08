import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Sidebar } from "@/components/Sidebar";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log("Sidebar toggled:", !isSidebarOpen);
    console.log("Current location:", location.pathname);
  };

  return (
    <div className="flex min-h-screen bg-[#FFDEE2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;