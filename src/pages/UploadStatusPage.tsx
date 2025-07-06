import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Check, Clock, Download, FileText, RefreshCw, Upload, X, Trash2 } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";
import { formatRelativeDate } from "@/lib/utils";

// Define the Resume type
type Resume = {
  id: string;
  filename: string;
  originalName?: string;
  downloadUrl?: string;
  upload_date: string;
  status?: string;
  match_score?: number;
  summary?: string;
  skills?: string[];
  experience?: number | string;
  educationLevel?: string;
  category?: string;
};

const UploadStatusPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Function to fetch resumes directly from the API
  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching resumes from API endpoint:", API_ENDPOINTS.RESUME.GET_ALL);
      
      const response = await axios.get(API_ENDPOINTS.RESUME.GET_ALL);
      console.log("API Response:", response.data);
      
      // Map the response data to our Resume type
      const mappedResumes = response.data.map((resume: any) => ({
        id: resume.id,
        filename: resume.filename || "Resume",
        originalName: resume.filename,
        downloadUrl: resume.download_url,
        upload_date: resume.upload_date,
        status: resume.status || "pending",
        match_score: resume.match_score || 0,
        summary: resume.summary || "",
        skills: resume.skills || [],
        experience: typeof resume.experience === 'string' ? 
          parseInt(resume.experience) : resume.experience || 0,
        educationLevel: resume.educationLevel || "",
        category: resume.category || ""
      }));
      
      setResumes(mappedResumes);
      setError(null);
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError("Failed to load resumes. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load resumes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Load resumes on component mount
  useEffect(() => {
    fetchResumes();
    
    // Set up polling every 5 seconds
    const intervalId = setInterval(fetchResumes, 5000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchResumes]);

  // Check for URL parameters indicating a new upload
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newUpload = urlParams.get('new');
    
    if (newUpload) {
      console.log("New upload detected, refreshing immediately");
      fetchResumes();
      
      // Clear the URL parameter after handling it
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded and is being processed.",
      });
    }
  }, [fetchResumes, toast]);

  // Set up a custom event listener for resume uploads
  useEffect(() => {
    const handleResumeUploaded = () => {
      console.log("Resume uploaded event detected, refreshing immediately");
      fetchResumes();
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded and is being processed.",
      });
    };
    
    // Listen for a custom event that will be dispatched when a resume is uploaded
    window.addEventListener('resumeUploaded', handleResumeUploaded);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resumeUploaded', handleResumeUploaded);
    };
  }, [fetchResumes, toast]);

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchResumes();
    toast({
      title: "Refreshing",
      description: "Fetching the latest resumes...",
    });
  };

  // Helper function to get status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "reviewed":
      case "processed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Helper function to get status text
  const getStatusText = (status?: string) => {
    switch (status) {
      case "reviewed":
      case "processed":
        return "Processed";
      case "pending":
        return "Under Review";
      case "rejected":
        return "Not a Match";
      default:
        return "Processing";
    }
  };

  // Helper function to download resume
  const downloadResume = async (resume: Resume) => {
    try {
      toast({
        title: "Download Starting",
        description: `Downloading ${resume.filename}...`,
      });

      const response = await fetch(`${API_BASE_URL}/api/resumes/download/${resume.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Get the file blob
      const blob = await response.blob();
      
      // Create a download URL
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = resume.originalName || resume.filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: `${resume.originalName || resume.filename} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download resume. Please try again.",
      });
    }
  };

  // Helper function to view resume details
  const viewDetails = (resume: Resume) => {
    // Navigate to the resume details page
    navigate(`/resume/${resume.id}`);
  };

  // Helper function to delete resume
  const deleteResume = async (resume: Resume) => {
    if (!window.confirm(`Are you sure you want to delete "${resume.originalName || resume.filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/${resume.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      // Remove the resume from the local state
      setResumes(prev => prev.filter(r => r.id !== resume.id));
      
      toast({
        title: "Resume Deleted",
        description: `${resume.originalName || resume.filename} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete resume. Please try again.",
      });
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <motion.h1 
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Resumes
          </motion.h1>
          <div className="flex gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                onClick={() => navigate("/upload")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" /> Upload New Resume
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="border-white/20 hover:bg-white/10"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                Refresh
              </Button>
            </motion.div>
          </div>
        </div>

        {loading && resumes.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading resumes...</p>
          </div>
        ) : error && resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-center"
          >
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Resumes</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="border-white/20 hover:bg-white/10"
            >
              Try Again
            </Button>
          </motion.div>
        ) : resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-lg bg-white/5 border border-white/10 text-center"
          >
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Resumes Found</h3>
            <p className="text-gray-400 mb-6">
              Upload your first resume to get started with ResuMatch.
            </p>
            <Button 
              onClick={() => navigate("/upload")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Upload Resume
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className={isRefreshing ? 'opacity-50 transition-opacity duration-300' : ''}
              >
                <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-white">{resume.originalName || resume.filename}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5">
                        {getStatusIcon(resume.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(resume.status)}
                        </span>
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">
                      Uploaded {formatRelativeDate(resume.upload_date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-300">
                          {resume.status === "pending" ? (
                            "Your resume is being processed"
                          ) : (
                            `Status: ${getStatusText(resume.status)}`
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-white/20 hover:bg-white/10"
                          onClick={() => downloadResume(resume)}
                        >
                          <Download className="h-3 w-3 mr-1" /> Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-white/20 hover:bg-white/10"
                          onClick={() => viewDetails(resume)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-white/20 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-colors group"
                          onClick={() => deleteResume(resume)}
                          title="Delete resume"
                        >
                          <Trash2 className="h-3 w-3 group-hover:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UploadStatusPage;
