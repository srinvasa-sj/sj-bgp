import { Facebook, Instagram, MessageCircle } from "lucide-react";

const socialLinks = [
  { 
    href: "https://wa.me/919923556214", 
    icon: MessageCircle, 
    label: "JOIN US", 
    color: "#25D366",
    className: "hover:bg-[#25D366]/10" 
  },
  { 
    href: "https://www.instagram.com/yourusername", 
    icon: Instagram, 
    label: "FOLLOW", 
    color: "#ac2bac",
    className: "hover:bg-[#ac2bac]/10"
  },
  { 
    href: "https://www.facebook.com/yourusername", 
    icon: Facebook, 
    label: "FOLLOW", 
    color: "#3b5998",
    className: "hover:bg-[#3b5998]/10"
  },
];

export const SidebarSocial = () => {
  return (
    <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-[#FFD700]/30">
      {socialLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-full transition-all hover:scale-110 ${link.className}`}
          style={{ color: link.color }}
        >
          <link.icon className="h-7 w-7" />
        </a>
      ))}
    </div>
  );
};