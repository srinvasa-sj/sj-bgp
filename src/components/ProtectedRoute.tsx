import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          toast.error("Please login to access this page");
          navigate("/login");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setUserData(userData);

        if (requireAdmin && (!userData || userData.role !== "admin")) {
          toast.error("Unauthorized access. Admin privileges required.");
          navigate("/");
          return;
        } else if (!requireAdmin && (!userData || (userData.role !== "admin" && userData.role !== "Customer"))) {
          toast.error("Unauthorized access. Please login as a Customer or Admin.");
          navigate("/login");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication error");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
} 