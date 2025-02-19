import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  role: string;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
          setNewName(`${userDoc.data().firstName || ''} ${userDoc.data().lastName || ''}`);
          setNewImageUrl(userDoc.data().profileImageUrl || "");
          setNewPhone(userDoc.data().phone || "");
        } else {
          toast.error('User data not found');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const updateProfile = async () => {
    if (!auth.currentUser) {
      toast.error("No user logged in");
      return;
    }

    try {
      const [firstName, ...lastNameParts] = newName.trim().split(" ");
      const lastName = lastNameParts.join(" ");

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        firstName,
        lastName,
        profileImageUrl: newImageUrl,
        phone: newPhone
      });

      setUserData(prev => ({
        ...prev,
        firstName,
        lastName,
        profileImageUrl: newImageUrl,
        phone: newPhone
      }));

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            {userData.profileImageUrl && (
              <img
                src={userData.profileImageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'https://via.placeholder.com/150';
                }}
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-gray-500">{userData.email}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
              <p className="text-gray-500">No orders yet</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Wishlist</h2>
              <p className="text-gray-500">Your wishlist is empty</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 