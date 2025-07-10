
import { Layout } from "@/components/Layout";
import { ApplicantLoginForm } from "@/components/ApplicantLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Shield, Eye } from "lucide-react";

const UserLoginPage = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (userType === "applicant") {
        navigate("/upload-status");
      } else {
        navigate("/search");
      }
    }
  }, [isAuthenticated, userType, navigate]);

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col md:flex-row items-center justify-center py-12 px-4">
        {/* Left side content */}
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
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-full shadow-lg shadow-purple-500/20">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">
                Applicant Portal
              </h1>
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Track your application!
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-gray-300 mb-6">
                Log in to upload your resume and track its status through our advanced tracking system.
              </p>
              
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                    <Upload className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-gray-300">Easy resume uploading</p>
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                    <Eye className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-gray-300">Real-time application status</p>
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-gray-300">Secure personal information</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Right side login form */}
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ApplicantLoginForm />
        </motion.div>
      </div>
    </Layout>
  );
}

export default UserLoginPage;
