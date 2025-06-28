import { Layout } from "@/components/Layout";
import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Shield, Zap, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const SignupPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/search");
    }
  }, [isAuthenticated, navigate]);

  // Save user to localStorage for demo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("demoUsers") || "[]");
    if (users.find((u: any) => u.email === email)) {
      setError("User already exists. Please log in.");
      return;
    }
    users.push({ email, password, role: "applicant" });
    localStorage.setItem("demoUsers", JSON.stringify(users));
    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col md:flex-row items-center justify-center py-12 px-4">
        {/* Left side animated content */}
        <motion.div 
          className="w-full max-w-md mb-10 md:mb-0 md:mr-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-left text-white">
            <motion.div 
              className="flex items-center mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full shadow-lg shadow-blue-500/20">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                ResuMatch
              </h1>
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Create your account
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-gray-300 mb-6">
                Sign up to access the AI-powered resume matching platform and track your applications.
              </p>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-gray-300">Access to thousands of student resumes</p>
                </motion.div>
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-gray-300">AI-powered matching technology</p>
                </motion.div>
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                    <UserCheck className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-gray-300">Save hours on candidate screening</p>
                </motion.div>
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-gray-300">Secure and private resume handling</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        {/* Right side signup form with animation */}
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="w-full backdrop-blur-sm bg-white/90 shadow-xl border-t border-l border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center text-green-600">
                  <h2 className="text-xl font-semibold mb-2">Registration successful!</h2>
                  <p className="mb-4">You can now log in with your new account.</p>
                  <Button className="w-full" onClick={() => navigate("/user-login")}>Go to Login</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      required
                    />
                  </div>
                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold">Sign Up</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SignupPage; 