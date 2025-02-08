
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface CustomSidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function CustomSidebar({ items, className }: CustomSidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <nav>
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.href}
              className="flex items-center py-2 px-4 text-sm hover:bg-accent"
            >
              {item.icon && <Icon className="mr-2 h-4 w-4" />}
              {item.title}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
