import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import type { UserData } from "@/types/user";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { UserCircle, LogOut } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setIsAdmin(data.role === "admin");
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/");
      setIsAdmin(false);
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full w-72 bg-transparent text-white backdrop-blur-lg border-r-4 border-[#FFD700] shadow-2xl transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full p-6 space-y-6">
        {/* Sidebar Header */}
        <SidebarHeader onClose={() => setIsOpen(false)} />

        {/* Navigation */}
        <SidebarNavigation isAdmin={isAdmin} userData={userData} onClose={() => setIsOpen(false)} />

        {/* Logged-in User Section */}
        {userData && (
          <div className="flex flex-col items-center text-center mt-6 p-4 border-t-4 border-[#FFD700]">
            {/* Profile Image */}
            {userData.profileImageUrl ? (
              <img
                src={userData.profileImageUrl}
                alt="Profile"
                className="h-14 w-14 rounded-full border-2 border-[#FFD700] object-cover"
              />
            ) : (
              <UserCircle className="h-14 w-14 text-[#FFD700]" />
            )}

            {/* Display User Name */}
            <p className="text-lg font-semibold text-black mt-2">
              {userData?.firstName} {userData?.lastName || ""}
            </p>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 mt-2 text-lg font-medium text-black hover:text-[#c1e04f] transition-all"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        )}

        {/* Social Media Icons with 3D Glassy Effect */}
        <div className="flex justify-center space-x-4 mt-auto pb-6 border-t-4 border-[#FFD700] pt-3">
          {/* Facebook */}
          <a href="https://www.facebook.com/ranjithkumar.ranjithkumar.564/" target="_blank" rel="noopener noreferrer">
            <div className="group flex items-center justify-center rounded-full h-14 w-14 bg-blue-600 shadow-lg hover:scale-110 transition-all">
              <FaFacebook className="h-6 w-6 text-white" />
            </div>
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/srinavasa_jewellery_works?igsh=Znk5bHJuMzVpMno1" target="_blank" rel="noopener noreferrer">
            <div className="group flex items-center justify-center rounded-full h-14 w-14 bg-pink-500 shadow-lg hover:scale-110 transition-all">
              <FaInstagram className="h-6 w-6 text-white" />
            </div>
          </a>

          {/* Twitter */}
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <div className="group flex items-center justify-center rounded-full h-14 w-14 bg-blue-400 shadow-lg hover:scale-110 transition-all">
              <FaTwitter className="h-6 w-6 text-white" />
            </div>
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/919538538568" target="_blank" rel="noopener noreferrer">
            <div className="group flex items-center justify-center rounded-full h-14 w-14 bg-green-500 shadow-lg hover:scale-110 transition-all">
              <FaWhatsapp className="h-6 w-6 text-white" />
            </div>
          </a>
        </div>
      </div>
    </aside>
  );
};


