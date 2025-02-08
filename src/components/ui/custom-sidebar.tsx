
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "./button";

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
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={cn("pb-12 bg-card border-r border-border flex flex-col h-full", className)}>
      <nav className="flex flex-col flex-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.href}
              className="flex items-center py-2 px-4 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {item.icon && <Icon className="mr-2 h-4 w-4" />}
              {item.title}
            </a>
          );
        })}
      </nav>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="flex items-center justify-start w-full py-2 px-4 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {theme === 'dark' ? (
          <>
            <Sun className="mr-2 h-4 w-4" />
            Light Mode
          </>
        ) : (
          <>
            <Moon className="mr-2 h-4 w-4" />
            Dark Mode
          </>
        )}
      </Button>
    </div>
  );
}
