import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SearchForm } from "@/components/SearchForm";
import { ResumeResults } from "@/components/ResumeResults";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, AlertCircle, Code, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SearchPage = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasError, setHasError] = useState(false);
  const [jobDescriptionSkills, setJobDescriptionSkills] = useState<string[]>([]);
  const [analysisMode, setAnalysisMode] = useState<'ai' | 'regex'>('ai');
  
  // Get current tab from URL params
  const currentTab = searchParams.get('tab') || 'search';
  
  useEffect(() => {
    // Set analysis mode based on tab
    if (currentTab === 'analyze') {
      setAnalysisMode('ai');
    }
  }, [currentTab]);
  
  // Add error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught by SearchPage:", event.error);
      setHasError(true);
    };
    
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

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
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}            className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full"
          >
            <Brain className="h-6 w-6 text-white" />
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

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex space-x-4 bg-white/5 backdrop-blur-md p-2 rounded-lg border border-white/10">
            <Button
              variant={currentTab === 'search' ? 'default' : 'ghost'}
              onClick={() => navigate('/search')}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              Resume Search
            </Button>
            <Button
              variant={currentTab === 'analyze' ? 'default' : 'ghost'}
              onClick={() => navigate('/search?tab=analyze')}
              className="flex-1"
            >
              {analysisMode === 'ai' ? (
                <Zap className="h-4 w-4 mr-2" />
              ) : (
                <Code className="h-4 w-4 mr-2" />
              )}
              {analysisMode === 'ai' ? 'AI Analysis' : 'Regex Analysis'}
            </Button>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto">
          {currentTab === 'search' ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                variants={itemVariants}
                className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10 hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 mb-8"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                    <Brain className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Resume Search</h3>
                    <p className="text-gray-300">Upload or paste your job description to automatically find matching candidates.</p>
                  </div>
                </div>
                <SearchForm 
                  onJobDescriptionUpdate={setJobDescriptionSkills}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
                <ResumeResults jobDescriptionSkills={jobDescriptionSkills} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Analysis Tab Content */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        {analysisMode === 'ai' ? (
                          <>
                            <Zap className="h-5 w-5" />
                            AI-Powered Analysis
                          </>
                        ) : (
                          <>
                            <Code className="h-5 w-5" />
                            Regex-Based Analysis
                          </>
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {analysisMode === 'ai' 
                          ? 'Advanced AI analysis for precise resume matching'
                          : 'Fast regex-based pattern matching for quick results'
                        }
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant={analysisMode === 'ai' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setAnalysisMode('ai')}
                      >
                        AI Mode
                      </Badge>
                      <Badge 
                        variant={analysisMode === 'regex' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setAnalysisMode('regex')}
                      >
                        Regex Mode
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <SearchForm 
                    onJobDescriptionUpdate={setJobDescriptionSkills}
                    analysisMode={analysisMode}
                  />
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Analysis Results</h2>
                    <ResumeResults 
                      jobDescriptionSkills={jobDescriptionSkills}
                      analysisMode={analysisMode}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
