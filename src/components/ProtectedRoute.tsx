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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          toast.error("Please login to access this page");
          navigate("/login");
          return;
        }

        if (requireAdmin) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          
          if (!userData || userData.role !== "admin") {
            toast.error("Unauthorized access. Admin privileges required.");
            navigate("/");
            return;
          }
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