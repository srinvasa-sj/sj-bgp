import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle } from "lucide-react";

interface UserProfileProps {
  userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  } | null;
}

const UserProfile = ({ userData }: UserProfileProps) => {
  if (!userData) return null;

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={userData.profileImageUrl} />
          <AvatarFallback>
            <UserCircle className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">
            {userData.firstName} {userData.lastName}
          </h2>
          <p className="text-gray-600">{userData.email}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;