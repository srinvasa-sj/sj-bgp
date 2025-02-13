import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    profileImageUrl: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Store additional user data in Firestore with role
        await setDoc(doc(db, "users", userCredential.user.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          profileImageUrl: formData.profileImageUrl,
          role: "Customer", // Set role as Customer
        });

        toast.success("Account created successfully!");
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Check if user has admin role
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        const userData = userDoc.data();
        
        if (userData.role === "admin") {
          toast.success("Login successful!");
          navigate("/admin");
        } else if (userData.role === "Customer") {
          toast.success("Login successful!");
          navigate("/customer-dashboard");
        } else {
          toast.error("Unauthorized access. Please contact support.");
          await auth.signOut();
          return;
        }
      }
    } catch (error: any) {
      let errorMessage = "Unauthorized / Invalid credentials";
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast.error(errorMessage);
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background mt-16 sm:mt-0">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                  <Input
                    id="profileImageUrl"
                    name="profileImageUrl"
                    type="url"
                    value={formData.profileImageUrl}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full"
                placeholder="admin@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full">
              {isSignUp ? "Sign Up" : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-1"
            >
              {isSignUp ? "Sign In" : "Sign Up"} 
               Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;