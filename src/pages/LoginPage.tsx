import { Layout } from "@/components/Layout";
import { UserLoginForm } from "@/components/UserLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Shield, Zap, UserCheck } from "lucide-react";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/search");
    }
  }, [isAuthenticated, navigate]);

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
              Welcome back!
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-gray-300 mb-6">
                Log in to access the AI-powered resume matching platform and find the perfect candidates in seconds.
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
        
        {/* Right side login form with animation */}
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <UserLoginForm mode="login" />
        </motion.div>
      </div>
    </Layout>
  );
}

export default LoginPage;
