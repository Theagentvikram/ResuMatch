import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SearchForm } from "@/components/SearchForm";
import { ResumeResults } from "@/components/ResumeResults";
import { ResumeSummarizer } from "@/components/ResumeSummarizer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Brain, ChevronRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useResumes } from "@/contexts/ResumeContext";

const SearchPage = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("search");
  const [hasError, setHasError] = useState(false);
  
  // Add error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught by SearchPage:", event.error);
      setHasError(true);
    };
    
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // Parse the tab from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "analyze") {
      setActiveTab("analyze");
    }
  }, [location]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "analyze") {
      navigate("/search?tab=analyze", { replace: true });
    } else {
      navigate("/search", { replace: true });
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (userType !== "recruiter") {
      navigate("/upload-status"); // Redirect applicants to their status page
    }
  }, [isAuthenticated, userType, navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // If there's an error, show an error message with recovery options
  if (hasError) {
    return (
      <Layout>
        <div className="container py-12 max-w-4xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an error loading the search page. Please try refreshing the page or go back to the dashboard.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center p-2 mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full"
          >
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full"
            >
              {activeTab === "search" ? (
                <Search className="h-6 w-6 text-white" />
              ) : (
                <Brain className="h-6 w-6 text-white" />
              )}
            </motion.div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Recruiter Dashboard
            </span>
          </h1>
          <p className="text-gray-300">
            Find the perfect candidates using our AI-powered tools
          </p>
        </motion.div>
        
        <div className="max-w-5xl mx-auto">
          <Tabs 
            defaultValue="search" 
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-md border border-white/10 p-1 rounded-lg">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <TabsTrigger 
                    value="search" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 flex items-center gap-2 transition-all duration-300"
                  >
                    <Brain className="h-4 w-4" />
                    AI Analysis
                  </TabsTrigger>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <TabsTrigger 
                    value="analyze" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 flex items-center gap-2 transition-all duration-300"
                  >
                    <Search className="h-4 w-4" />
                    Resume Matching
                  </TabsTrigger>
                </motion.div>
              </TabsList>
            </motion.div>
            
            <AnimatePresence mode="wait">
              {activeTab === "search" && (
                <TabsContent value="search" className="space-y-8 outline-none">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
                  >
                    <motion.div 
                      variants={itemVariants}
                      className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10 hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                    >
                      <div className="flex items-start mb-4">
                        <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                          <Brain className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">AI Resume Analysis</h3>
                          <p className="text-gray-300">Use advanced AI to find the most relevant candidates based on semantic understanding.</p>
                        </div>
                      </div>
                      <SearchForm searchType="ai_analysis" />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <h2 className="text-xl font-semibold text-white mb-4">AI Analysis Results</h2>
                      <ResumeResults />
                    </motion.div>
                  </motion.div>
                </TabsContent>
              )}

              {activeTab === "analyze" && (
                <TabsContent value="analyze" className="space-y-8 outline-none">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
                  >
                    <motion.div
                      variants={itemVariants}
                      className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10 hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                    >
                      <div className="flex items-start mb-4">
                        <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                          <Search className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">Resume Matching</h3>
                          <p className="text-gray-300">Find resumes based on keyword relevance, experience, and education level.</p>
                        </div>
                      </div>
                      <SearchForm searchType="resume_matching" />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <h2 className="text-xl font-semibold text-white mb-4">Resume Matching Results</h2>
                      <ResumeResults />
                    </motion.div>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
