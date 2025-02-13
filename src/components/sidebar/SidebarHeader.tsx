import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SidebarHeaderProps {
  onClose: () => void;
}

export const SidebarHeader = ({ onClose }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4 px-2">
      <h2 className="text-xl lg:text-2xl font-bold text-foreground">Srinivasa Jewellers</h2>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden hover:bg-primary/10"
        onClick={onClose}
      >
        <X className="h-8 w-8 text-black" />
      </Button>
    </div>
  );
};
