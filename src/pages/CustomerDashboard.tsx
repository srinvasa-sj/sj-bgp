import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const CustomerDashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setNewName(`${data.firstName || ''} ${data.lastName || ''}`);
          setNewImageUrl(data.profileImageUrl || "");
          setNewPhone(data.phone || "");
        }
      }
    };
    fetchUserData();
  }, []);

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

  return (
    <div className="min-h-screen bg-background mt-16 sm:mt-0">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImageUrl">Profile Image URL</Label>
              <Input
                id="profileImageUrl"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={updateProfile} className="mt-4">Update Profile</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 