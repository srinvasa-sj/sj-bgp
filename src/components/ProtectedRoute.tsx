import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'seller' | 'customer';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const checkUserRole = async () => {
      if (requiredRole) {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error || !data || data.role !== requiredRole) {
          toast.error("You don't have permission to access this page");
          navigate("/");
        }
      }
    };

    checkUserRole();
  }, [user, navigate, requiredRole]);

  if (!user) return null;

  return <>{children}</>;
}