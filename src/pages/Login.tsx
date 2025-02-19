import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { validatePassword } from "@/utils/security/passwordValidation";
import { sessionManager } from "@/utils/security/sessionManager";
import { validateAndSanitizeObject, ValidationRules } from "@/utils/security/requestValidation";
import { getOptimizedDoc } from "@/utils/firebase/optimizedQueries";
import { useThrottledCallback } from "@/utils/performance/componentOptimizer";
import { useCachedResource } from "@/utils/performance/cacheOptimizer";

// Memoized initial form state
const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  profileImageUrl: "",
};

// URL validation helper
const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Allow empty URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize validation rules
  const validationRules = useMemo((): Record<keyof typeof initialFormState, ValidationRules> => ({
    email: { required: true, type: 'email' as const },
    password: { required: true, minLength: 8 },
    firstName: { required: isSignUp },
    lastName: { required: isSignUp },
    profileImageUrl: { required: false } // Remove URL validation here
  }), [isSignUp]);

  // Throttled form update to prevent excessive re-renders
  const handleInputChange = useThrottledCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, 100);

  // Cached user data fetching
  const { getData: getUserData } = useCachedResource(
    'userData',
    () => getOptimizedDoc(doc(db, "users", auth.currentUser?.uid || '')),
    { ttl: 5 * 60 * 1000 } // 5 minutes cache
  );

  const handlePasswordReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsSubmitting(true);
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent. Please check your inbox.");
      setShowResetForm(false);
    } catch (error: any) {
      toast.error("Error sending reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [resetEmail]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Validate URL separately
    if (isSignUp && formData.profileImageUrl && !isValidUrl(formData.profileImageUrl)) {
      toast.error("Please enter a valid URL for the profile image");
      return;
    }

    const validation = validateAndSanitizeObject(formData, validationRules);

    if (!validation.isValid) {
      const errors = Object.values(validation.errors).filter(Boolean);
      toast.error(errors[0]);
      return;
    }

    if (isSignUp && !validatePassword(formData.password)) {
      return;
    }

    try {
      setIsSubmitting(true);
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          validation.sanitizedData.email,
          validation.sanitizedData.password
        );

        // Only include profileImageUrl if it's not empty
        const userData = {
          firstName: validation.sanitizedData.firstName,
          lastName: validation.sanitizedData.lastName,
          email: validation.sanitizedData.email,
          role: "Customer",
          ...(validation.sanitizedData.profileImageUrl ? { 
            profileImageUrl: validation.sanitizedData.profileImageUrl 
          } : {})
        };

        await setDoc(doc(db, "users", userCredential.user.uid), userData);
        toast.success("Account created successfully!");
        navigate("/customer-dashboard");
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          validation.sanitizedData.email,
          validation.sanitizedData.password
        );
        
        const userData = await getUserData();
        
        if (userData?.role === "admin") {
          sessionManager.startTracking();
          toast.success("Login successful!");
          navigate("/admin");
        } else if (userData?.role === "Customer") {
          sessionManager.startTracking();
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
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSignUp, navigate, validationRules, getUserData, isSubmitting]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      sessionManager.stopTracking();
    };
  }, []);

  const renderForm = useMemo(() => {
    if (showResetForm) {
      return (
        <div className="min-h-screen bg-background mt-16 sm:mt-0">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                <p className="text-gray-500 mt-2">Enter your email to reset password</p>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowResetForm(false)}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Back to Login
                </Button>
              </form>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background mt-16 sm:mt-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {isSignUp ? "Create Account" : "Login"}
              </h1>
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
                      defaultValue={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      defaultValue={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                    <Input
                      id="profileImageUrl"
                      name="profileImageUrl"
                      type="url"
                      defaultValue={formData.profileImageUrl}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="https://example.com/image.jpg"
                      disabled={isSubmitting}
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
                  defaultValue={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  placeholder="email@example.com"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    defaultValue={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pr-10"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isSignUp ? "Creating Account..." : "Logging in..."}
                  </span>
                ) : (
                  isSignUp ? "Sign Up" : "Login"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-gray-600">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setFormData(initialFormState);
                }}
                className="text-primary"
                disabled={isSubmitting}
              >
                {isSignUp ? "Login" : "Sign Up"}
              </Button>
              {!isSignUp && (
                <Button
                  variant="link"
                  onClick={() => setShowResetForm(true)}
                  className="text-primary block w-full"
                  disabled={isSubmitting}
                >
                  Forgot Password?
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [showResetForm, isSignUp, formData, showPassword, isSubmitting, handleSubmit, handlePasswordReset, handleInputChange, resetEmail]);

  return renderForm;
};

export default Login;