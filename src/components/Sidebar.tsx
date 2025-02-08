// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { cn } from "@/lib/utils";
// import { auth, db } from "@/lib/firebase";
// import { signOut, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { toast } from "sonner";
// import type { UserData } from "@/types/user";
// import { SidebarHeader } from "./sidebar/SidebarHeader";
// import { SidebarNavigation } from "./sidebar/SidebarNavigation";
// import { SidebarUser } from "./sidebar/SidebarUser";
// import { SidebarSocial } from "./sidebar/SidebarSocial";

// interface SidebarProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [isAdmin, setIsAdmin] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           setUserData(userDoc.data() as UserData);
//           setIsAdmin(true);
//         }
//       } else {
//         setUserData(null);
//         setIsAdmin(false);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       toast.success("Logged out successfully");
//       navigate("/");
//       setIsAdmin(false);
//     } catch (error) {
//       console.error("Error logging out:", error);
//       toast.error("Error logging out");
//     }
//   };

//   return (
//     <aside
//       className={cn(
//         "fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-sm border-r-2 border-[#FFD700] shadow-lg transform transition-transform duration-300 ease-in-out z-50",
//         isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//       )}
//     >
//       <div className="flex flex-col h-full p-4">
//         <SidebarHeader onClose={() => setIsOpen(false)} />
//         <SidebarNavigation isAdmin={isAdmin} onClose={() => setIsOpen(false)} />
//         <SidebarUser userData={userData} onLogout={handleLogout} />
//         <SidebarSocial />
//       </div>
//     </aside>
//   );
// };

//---------------------------------------------------------//
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { cn } from "@/lib/utils";
// import { auth, db } from "@/lib/firebase";
// import { signOut, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { toast } from "sonner";
// import type { UserData } from "@/types/user";
// import { SidebarHeader } from "./sidebar/SidebarHeader";
// import { SidebarNavigation } from "./sidebar/SidebarNavigation";
// import { SidebarUser } from "./sidebar/SidebarUser";
// import { SidebarSocial } from "./sidebar/SidebarSocial";

// interface SidebarProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [isAdmin, setIsAdmin] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           setUserData(userDoc.data() as UserData);
//           setIsAdmin(true);
//         }
//       } else {
//         setUserData(null);
//         setIsAdmin(false);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       toast.success("Logged out successfully");
//       navigate("/");
//       setIsAdmin(false);
//     } catch (error) {
//       console.error("Error logging out:", error);
//       toast.error("Error logging out");
//     }
//   };

//   return (
//     <aside
//       className={cn(
//         "fixed top-0 left-0 h-full w-72 bg-[#b5e4c97e] text-white backdrop-blur-lg border-r-4 border-[#FFD700] shadow-2xl transform transition-transform duration-300 ease-in-out z-50",
//         isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//       )}
//     >
//       <div className="flex flex-col h-full p-6 space-y-6">
//         {/* Sidebar Header */}
//         <SidebarHeader onClose={() => setIsOpen(false)} />

//         {/* Navigation */}
//         <SidebarNavigation isAdmin={isAdmin} onClose={() => setIsOpen(false)} />

//         {/* User Profile & Logout */}
//         <SidebarUser userData={userData} onLogout={handleLogout} />

//         {/* Social Media Links */}
//         <SidebarSocial />
//       </div>
//     </aside>
//   );
// };

//----------------------------------------------------//
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { cn } from "@/lib/utils";
// import { auth, db } from "@/lib/firebase";
// import { signOut, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { toast } from "sonner";
// import type { UserData } from "@/types/user";
// import { SidebarHeader } from "./sidebar/SidebarHeader";
// import { SidebarNavigation } from "./sidebar/SidebarNavigation";
// import { UserCircle, LogOut } from "lucide-react";
// import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

// interface SidebarProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [isAdmin, setIsAdmin] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           const userData = userDoc.data() as UserData;
//           setUserData(userData);
//           setIsAdmin(true);
//         }
//       } else {
//         setUserData(null);
//         setIsAdmin(false);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       toast.success("Logged out successfully");
//       navigate("/");
//       setIsAdmin(false);
//     } catch (error) {
//       console.error("Error logging out:", error);
//       toast.error("Error logging out");
//     }
//   };

//   return (
//     <aside
//       className={cn(
//         "fixed top-0 left-0 h-full w-72  bg-transparent text-white backdrop-blur-lg border-r-4 border-[#FFD700] shadow-2xl transform transition-transform duration-300 ease-in-out z-50",
//         isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//       )}
//     >
//       <div className="flex flex-col h-full p-2 space-y-0 pt-1" >
//         {/* Sidebar Header */}
//         <SidebarHeader onClose={() => setIsOpen(false)} />

//         {/* Navigation */}
//         <SidebarNavigation isAdmin={isAdmin} onClose={() => setIsOpen(false)} />

//         {/* Logged-in User Section */}
//         {userData && (
//           <div className="flex flex-col items-center text-center mt-4 p-4 border-t-2 border-gold-600 pt-1">
//             {/* Profile Image */}
//             {userData.profileImageUrl ? (
//               <img
//                 src={userData.profileImageUrl}
//                 alt="Profile"
//                 className="h-14 w-14 rounded-full border-2 border-[#FFD700] object-cover"
//               />
//             ) : (
//               <UserCircle className="h-8 w-8 text-[#FFD700]" />
//             )}

//             {/* Display Name */}
//             <p className="text-sm font-semibold text-[#1900ff] mt-2">
//               {userData.firstName} {userData.lastName || ""}
//             </p>

           

//             {/* Logout Button */}
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-[#571e1e] transition-all"
//             >
//               <LogOut className="h-4 w-4" />
//               Logout
//             </button>
//           </div>
//         )}

//         {/* Social Media Icons */}
//         <div className="flex justify-center space-x-2 mt-auto pb-4 border-t-2 border-gold-200 pt-1">
//           <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className=" text-glassy text-gray-900 hover:text-[#003cff] transition-all">
//             <FaFacebook className="h-10 w-10" />
//           </a>
//           <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className=" text-glassy text-gray-900 hover:text-[#003cff] transition-all">
//             <FaInstagram className="h-10 w-10" />
//           </a>
//           <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className=" text-glassy text-gray-900 hover:text-[#003cff] transition-all">
//             <FaTwitter className="h-10 w-10" />
//           </a>
//           <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="text-glassy text-gray-900 hover:text-[#003cff] transition-all">
//             <FaWhatsapp className="h-10 w-10" />
//           </a>
          
//         </div>
//       </div>
//     </aside>
//   );
// };
//------------------------------------------------------------------------//
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { cn } from "@/lib/utils";
// import { auth, db } from "@/lib/firebase";
// import { signOut, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { toast } from "sonner";
// import type { UserData } from "@/types/user";
// import { SidebarHeader } from "./sidebar/SidebarHeader";
// import { SidebarNavigation } from "./sidebar/SidebarNavigation";
// import { UserCircle, LogOut } from "lucide-react";
// import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

// interface SidebarProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [isAdmin, setIsAdmin] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           const userData = userDoc.data() as UserData;
//           setUserData(userData);
//           setIsAdmin(true);
//         }
//       } else {
//         setUserData(null);
//         setIsAdmin(false);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       toast.success("Logged out successfully");
//       navigate("/");
//       setIsAdmin(false);
//     } catch (error) {
//       console.error("Error logging out:", error);
//       toast.error("Error logging out");
//     }
//   };

//   return (
//     <aside
//       className={cn(
//         "fixed top-0 left-0 h-full w-72 bg-transparent text-white backdrop-blur-lg border-r-4 border-[#FFD700] shadow-2xl transform transition-transform duration-300 ease-in-out z-50",
//         isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//       )}
//     >
//       <div className="flex flex-col h-full p-6 space-y-6">
//         {/* Sidebar Header */}
//         <SidebarHeader onClose={() => setIsOpen(false)} />

//         {/* Navigation */}
//         <SidebarNavigation isAdmin={isAdmin} onClose={() => setIsOpen(false)} />

//         {/* Logged-in User Section */}
//         {userData && (
//           <div className="flex flex-col items-center text-center mt-6 p-4 border-t-2 border-gold-900">
//             {/* Profile Image */}
//             {userData.profileImageUrl ? (
//               <img
//                 src={userData.profileImageUrl}
//                 alt="Profile"
//                 className="h-14 w-14 rounded-full border-2 border-[#FFD700] object-cover"
//               />
//             ) : (
//               <UserCircle className="h-14 w-14 text-[#FFD700]" />
//             )}

//             {/* Display Name */}
//             <p className="text-lg font-semibold text-[#060c03] mt-2">
//               {userData.firstName} {userData.lastName || ""}
//             </p>

//             {/* Email */}
//             <p className="text-sm text-gray-400">{userData.email || "No Email Available"}</p>

//             {/* Logout Button */}
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 mt-4 text-xl font-medium text-black hover:text-[#c1e04f] transition-all"
//             >
//               <LogOut className="h-4 w-4" />
//               Logout
//             </button>
//           </div>
//         )}

//         {/* Social Media Icons */}
//         <div className="flex justify-center space-x-4 mt-auto pb-6 border-t-2 border-gold-900 pt-4">
//           <a href="https://www.facebook.com/ranjithkumar.ranjithkumar.564/" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-[#1815ca] transition-all">
//             <FaFacebook className="h-8 w-8" />
//           </a>
//           <a href="https://www.instagram.com/srinavasa_jewellery_works?igsh=Znk5bHJuMzVpMno1" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-[#1815ca] transition-all">
//             <FaInstagram className="h-8 w-8" />
//           </a>
//           <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-[#1815ca] transition-all">
//             <FaTwitter className="h-8 w-8" />
//           </a>
//           <a href="https://wa.me/919538538568" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-[#1815ca] transition-all">
//             <FaWhatsapp className="h-8 w-8" />
//           </a>
//         </div>
//       </div>
//     </aside>
//   );
// };

//---------------------------------------------//
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
          const userData = userDoc.data() as UserData;
          setUserData(userData);
          setIsAdmin(true);
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
        "fixed top-0 left-0 h-full w-72 bg-transparent text-white backdrop-blur-lg border-r-4 border-[#FFD700] shadow-2xl transform transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full p-6 space-y-6">
        {/* Sidebar Header */}
        <SidebarHeader onClose={() => setIsOpen(false)} />

        {/* Navigation */}
        <SidebarNavigation isAdmin={isAdmin} onClose={() => setIsOpen(false)} />

        {/* Logged-in User Section */}
        {userData && (
          <div className="flex flex-col items-center text-center mt-6 p-4 border-t-4 border-gold-900">
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

            {/* Display Name */}
            <p className="text-lg font-semibold text-[#060c03] mt-2">
              {userData.firstName} {userData.lastName || ""}
            </p>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 mt-1 text-xl font-medium text-black hover:text-[#c1e04f] transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}

        {/* Social Media Icons with 3D Glassy Effect */}
        <div className="flex justify-center space-x-4 mt-auto pb-6 border-t-4 border-gold-900 pt-3">
          {/* Facebook */}
          <a href="https://www.facebook.com/ranjithkumar.ranjithkumar.564/" target="_blank" rel="noopener noreferrer">
            <div className="group flex items-center justify-center rounded-full h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-700 border border-white/30 shadow-lg shadow-blue-500/50 backdrop-blur-md transition-transform transform hover:scale-110 hover:shadow-2xl">
              <FaFacebook className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-125 transition-all" />
            </div>
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/srinavasa_jewellery_works?igsh=Znk5bHJuMzVpMno1" target="_blank" rel="noopener noreferrer">
            <div className="group flex items-center justify-center rounded-full h-14 w-14 bg-gradient-to-br from-pink-500 to-purple-700 border border-white/30 shadow-lg shadow-pink-500/50 backdrop-blur-md transition-transform transform hover:scale-110 hover:shadow-2xl">
              <FaInstagram className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-125 transition-all" />
            </div>
          </a>

          {/* Twitter */}
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <div className="group flex items-center justify-center rounded-full h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 border border-white/30 shadow-lg shadow-blue-400/50 backdrop-blur-md transition-transform transform hover:scale-110 hover:shadow-2xl">
              <FaTwitter className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-125 transition-all" />
            </div>
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/919538538568" target="_blank" rel="noopener noreferrer">
            <div className="group flex items-center justify-center rounded-full h-14 w-14 bg-gradient-to-br from-green-500 to-green-700 border border-white/30 shadow-lg shadow-green-500/50 backdrop-blur-md transition-transform transform hover:scale-110 hover:shadow-2xl">
              <FaWhatsapp className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-125 transition-all" />
            </div>
          </a>
        </div>
      </div>
    </aside>
  );
};
