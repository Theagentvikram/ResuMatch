import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon, LogInIcon, Mail, Building } from "lucide-react";

export function RecruiterLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Validate company email domain
  const isValidCompanyEmail = (email: string) => {
    const companyDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'aol.com', 'protonmail.com', 'mail.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    
    // For demo purposes, allow some common business domains or non-personal domains
    if (!domain) return false;
    
    // Reject common personal email domains
    if (companyDomains.includes(domain)) {
      return false;
    }
    
    // Accept business-looking domains or specific test domains
    return domain.includes('.') && (
      domain.includes('corp') || 
      domain.includes('inc') || 
      domain.includes('ltd') || 
      domain.includes('company') ||
      domain.includes('tech') ||
      email === 'recruiter@company.com' || // Test account
      email === 'hr@techcorp.com' // Test account
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Enhanced validation for recruiters
    if (!email || !password || !companyName) {
      toast({
        title: "Validation Error",
        description: "All fields are required for recruiter access.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isValidCompanyEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please use a company email address. Personal email domains are not allowed for recruiter accounts.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // For demo purposes, accept specific test credentials or validate email format
      if ((email === 'recruiter@company.com' || email === 'hr@techcorp.com') && password === 'recruiter123') {
        const user = {
          id: '1',
          username: email.split('@')[0],
          password: 'hidden', // Required by type but not used in demo
          role: 'recruiter' as const
        };
        
        login(user);
        toast({
          title: "Login successful",
          description: `Welcome, ${companyName} recruiter!`,
        });
        navigate("/search");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials. For demo: use 'recruiter@company.com' or 'hr@techcorp.com' with password 'recruiter123'.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
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
          <CardTitle className="text-2xl text-center">Recruiter Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the resume search platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" /> Company Name
              </Label>
              <div className="relative">
                <Input
                  id="company"
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
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Company Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="recruiter@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-3 bg-white/50 focus:bg-white transition-all duration-300"
                  required
                />
              </div>
              <div className="text-xs text-brand-blue">
                Demo: Use "recruiter@company.com" or "hr@techcorp.com"
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
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
                  placeholder="Enter your password"
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
              <div className="text-xs text-brand-blue">
                Demo: Use "recruiter123" as password
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 transition-all duration-300 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogInIcon className="h-4 w-4" /> Login as Recruiter
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t pt-4">
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Don't have a recruiter account? Contact the administrator.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-500 w-full"
              onClick={() => navigate("/user-login")}
            >
              Switch to Applicant Login
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
