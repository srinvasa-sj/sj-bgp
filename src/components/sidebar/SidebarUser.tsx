import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { UserData } from "@/types/user";

interface SidebarUserProps {
  userData: UserData | null;
  onLogout: () => void;
}

export const SidebarUser = ({ userData, onLogout }: SidebarUserProps) => {
  if (!userData) return null;

  return (
    <div className="border-t border-[#FFD700]/30 pt-4 mb-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-[#FFD700]">
          <AvatarImage src={userData.profileImageUrl || userData.photoURL} />
          <AvatarFallback className="text-base">
            {userData.firstName?.[0]}
            {userData.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-base lg:text-lg">
            {userData.firstName} {userData.lastName}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        className="w-full mt-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors text-base lg:text-lg"
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
        Logout
      </Button>
    </div>
  );
};