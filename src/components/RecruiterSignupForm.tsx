import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon, Building, Mail, User, UserPlusIcon } from "lucide-react";

export function RecruiterSignupForm() {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Validate company email domain
  const isValidCompanyEmail = (email: string) => {
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'aol.com', 'protonmail.com', 'mail.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) return false;
    
    // Reject common personal email domains
    if (personalDomains.includes(domain)) {
      return false;
    }
    
    // Accept business-looking domains
    return domain.includes('.') && domain.length > 4;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !companyName || !recruiterName || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!isValidCompanyEmail(email)) {
      setError("Please use a company email address. Personal email domains (gmail, yahoo, etc.) are not allowed for recruiter accounts.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    setIsLoading(true);
    try {
      // Create a new recruiter account (for demo purposes)
      const newRecruiter = {
        id: Date.now().toString(),
        username: email, // Use email as username
        password: password, // In real app, this would be hashed
        role: 'recruiter' as const,
        companyName: companyName,
        recruiterName: recruiterName
      };
      
      // Save to localStorage (in real app, this would be an API call)
      const existingUsers = JSON.parse(localStorage.getItem("resumatch_users") || "[]");
      
      // Check if email already exists
      if (existingUsers.some((user: any) => user.username === email)) {
        setError("An account with this email already exists. Please use a different email or login instead.");
        return;
      }
      
      existingUsers.push(newRecruiter);
      localStorage.setItem("resumatch_users", JSON.stringify(existingUsers));
      
      setSuccess(true);
      toast({
        title: "Recruiter account created successfully!",
        description: `Welcome to ResuMatch, ${companyName}! You can now post jobs and search for candidates.`,
      });
      
      // Auto-login the recruiter after successful signup
      setTimeout(() => {
        login(newRecruiter);
        navigate("/search");
      }, 1500);
      
    } catch (error) {
      setError("Signup failed. Please try again.");
      toast({
        title: "Signup error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full backdrop-blur-sm bg-white/90 shadow-xl border-t border-l border-white/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Create Recruiter Account
          </CardTitle>
          <CardDescription className="text-center">
            Join ResuMatch to post jobs and find the perfect candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center text-green-600 font-semibold py-8">
              Recruiter account created successfully! Logging you in...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building className="h-4 w-4" /> Company Name
                </Label>
                <div className="relative">
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter your company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-3 bg-white/50 focus:bg-white transition-all duration-300"
                    required
                  />
                </div>
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label htmlFor="recruiterName" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Your Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="recruiterName"
                    type="text"
                    placeholder="Enter your full name"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="pl-3 bg-white/50 focus:bg-white transition-all duration-300"
                    required
                  />
                </div>
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Company Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your company email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-3 bg-white/50 focus:bg-white transition-all duration-300"
                    required
                  />
                </div>
                <div className="text-xs text-gray-500">
                  Must be a company email (not personal domains like gmail, yahoo, etc.)
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Label htmlFor="password" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-white/50 focus:bg-white transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Password must be at least 6 characters long
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 bg-white/50 focus:bg-white transition-all duration-300"
                    required
                  />
                </div>
              </motion.div>
              
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:opacity-90 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="h-4 w-4" /> Create Recruiter Account
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t pt-4">
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Already have a recruiter account?{' '}
            <span className="text-purple-500 hover:underline cursor-pointer" onClick={() => navigate('/recruiter-login')}>
              Login here
            </span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-500 w-full"
              onClick={() => navigate("/signup")}
            >
              Are you a job seeker? Sign up here
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
