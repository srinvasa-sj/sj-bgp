
import React from "react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface CustomSidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function CustomSidebar({ items, className }: CustomSidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <nav>
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="flex items-center py-2 px-4 text-sm hover:bg-accent"
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
