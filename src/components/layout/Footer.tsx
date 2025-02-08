// import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

// const Footer = () => {
//   return (
//     <footer className="bg-gray-900 text-white py-2">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
//           <div>
//             <h3 className="text-xs font-semibold mb-0.5">About Us</h3>
//             <p className="text-xs text-gray-400">
//               Srinivas Jewellers has been crafting beautiful jewelry since 1990. 
//               We take pride in our quality and customer service.
//             </p>
//           </div>
          
//           <div>
//             <h3 className="text-xs font-semibold mb-0.5">Quick Links</h3>
//             <ul className="space-y-0.5">
//               <li><a href="/products" className="text-xs text-gray-400 hover:text-white transition-colors">Products</a></li>
//               <li><a href="/about" className="text-xs text-gray-400 hover:text-white transition-colors">About Us</a></li>
//               <li><a href="/contact" className="text-xs text-gray-400 hover:text-white transition-colors">Contact</a></li>
//               <li><a href="/gallery" className="text-xs text-gray-400 hover:text-white transition-colors">Gallery</a></li>
//             </ul>
//           </div>
          
//           <div>
//             <h3 className="text-xs font-semibold mb-0.5">Contact Info</h3>
//             <ul className="space-y-0.5">
//               <li className="flex items-center space-x-1">
//                 <Phone className="h-3 w-3" />
//                 <span className="text-xs text-gray-400">+91 123 456 7890</span>
//               </li>
//               <li className="flex items-center space-x-1">
//                 <Mail className="h-3 w-3" />
//                 <span className="text-xs text-gray-400">info@srivasjewellers.com</span>
//               </li>
//               <li className="flex items-center space-x-1">
//                 <MapPin className="h-3 w-3" />
//                 <span className="text-xs text-gray-400">123 Main Street, City, State</span>
//               </li>
//             </ul>
//           </div>
          
//           <div>
//             <h3 className="text-xs font-semibold mb-0.5">Follow Us</h3>
//             <div className="flex space-x-2">
//               <a 
//                 href="https://facebook.com" 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200"
//               >
//                 <Facebook className="h-4 w-4" />
//               </a>
//               <a 
//                 href="https://instagram.com" 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200"
//               >
//                 <Instagram className="h-4 w-4" />
//               </a>
//               <a 
//                 href="https://twitter.com" 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200"
//               >
//                 <Twitter className="h-4 w-4" />
//               </a>
//             </div>
//           </div>
//         </div>
        
//         <div className="border-t border-gray-800 mt-1 pt-1 text-center">
//           <p className="text-xs text-gray-400">
//             © {new Date().getFullYear()} Srinivas Jewellers. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#1a1a1a] to-[#333] text-white py-12 shadow-lg">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About Us Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2 text-[#FFD700] hover:text-[#FFB800] transition-colors duration-300">
              About Us
            </h3>
            <p className="text-sm text-gray-400">
              Srinivas Jewellers has been crafting beautiful jewelry since 1990. 
              We take pride in our quality, innovation, and customer service. 
              Our designs are timeless and loved by generations.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2 text-[#FFD700] hover:text-[#FFB800] transition-colors duration-300">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><a href="/products" className="text-sm text-gray-400 hover:text-[#FFD700] transition-colors duration-300">Products</a></li>
              <li><a href="/about" className="text-sm text-gray-400 hover:text-[#FFD700] transition-colors duration-300">About Us</a></li>
              <li><a href="/contact" className="text-sm text-gray-400 hover:text-[#FFD700] transition-colors duration-300">Contact</a></li>
              <li><a href="/gallery" className="text-sm text-gray-400 hover:text-[#FFD700] transition-colors duration-300">Gallery</a></li>
            </ul>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2 text-[#FFD700] hover:text-[#FFB800] transition-colors duration-300">
              Contact Info
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+91 953 853 8568</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="h-4 w-4" />
                <span>info@srivasjewellers.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Bajana Mandhir Road
                      Opposite Government Hospital
                      Bagepalli
                </span>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2 text-[#FFD700] hover:text-[#FFB800] transition-colors duration-300">
              Follow Us
            </h3>
            <div className="flex space-x-2">
              <a 
                href="https://www.facebook.com/ranjithkumar.ranjithkumar.564/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#FFD700] hover:scale-125 transition-all transform duration-300"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://www.instagram.com/srinavasa_jewellery_works?igsh=Znk5bHJuMzVpMno1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#FFD700] hover:scale-125 transition-all transform duration-300"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#FFD700] hover:scale-125 transition-all transform duration-300"
              >
                <Twitter className="h-6 w-6" />
                
              </a>
              <a 
                href="https://wa.me/919538538568" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#FFD700] hover:scale-125 transition-all transform duration-300"
              >
                <FaWhatsapp className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Srinivas-Jewellers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
