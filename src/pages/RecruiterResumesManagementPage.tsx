import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Check, Clock, X } from "lucide-react";
import { useResumes } from "@/contexts/ResumeContext";
import { useToast } from "@/components/ui/use-toast";
import { formatRelativeDate } from "@/lib/utils";
import { deleteUserResume } from "@/lib/api"; // Import the delete function

type Resume = {
  id: string;
  filename: string;
  originalName?: string;
  downloadUrl?: string;
  upload_date?: string;
  uploadDate?: string; // From context
  status?: string;
  match_score?: number;
  matchScore?: number; // From context
  summary?: string;
  skills?: string[];
  experience?: number | string;
  educationLevel?: string;
  category?: string;
};

export function RecruiterResumesManagementPage() {
  const [localResumes, setLocalResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { resumes: contextResumes, loadUserResumes, deleteResume: deleteResumeFromContext } = useResumes();

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    console.log("Fetching resumes for management page");
    try {
      if (typeof loadUserResumes === 'function') {
        await loadUserResumes();
        if (contextResumes && contextResumes.length > 0) {
          const mappedResumes = contextResumes.map(r => ({
            id: r.id,
            filename: r.filename || r.name || 'resume.pdf',
            originalName: r.originalName || r.name,
            downloadUrl: r.downloadUrl,
            upload_date: r.uploadDate || new Date().toISOString(),
            status: r.status || 'pending',
            match_score: r.matchScore || 0,
            summary: r.summary || '',
            skills: r.skills || [],
            experience: r.experience || 0,
            educationLevel: r.educationLevel || '',
            category: r.category || ''
          }));
          setLocalResumes(mappedResumes);
          setError(null);
        }
      }
    } catch (err) {
      console.error("Error fetching resumes for management:", err);
      setError("Failed to load resumes for management. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load resumes for management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [loadUserResumes, contextResumes, toast]);

  useEffect(() => {
    fetchResumes();
    const pollingId = setInterval(fetchResumes, 10000); // Poll every 10 seconds
    return () => clearInterval(pollingId);
  }, [fetchResumes]);

  const handleDownload = (resume: Resume) => {
    if (resume.downloadUrl) {
      window.open(resume.downloadUrl, "_blank");
    } else {
      toast({
        title: "Download Unavailable",
        description: "This resume does not have a downloadable link.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (window.confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      try {
        const success = await deleteUserResume(resumeId);
        if (success) {
          deleteResumeFromContext(resumeId); // Update context
          setLocalResumes(prev => prev.filter(r => r.id !== resumeId)); // Update local state
          toast({
            title: "Resume Deleted",
            description: "The resume has been successfully deleted.",
          });
        } else {
          toast({
            title: "Deletion Failed",
            description: "Could not delete the resume. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting resume:", error);
        toast({
          title: "Deletion Error",
          description: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        });
      }
    }
  };

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

  if (loading && localResumes.length === 0) {
    return <div className="text-center py-8">Loading resumes...</div>;
  }

  if (error && localResumes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchResumes}>Try Again</Button>
      </div>
    );
  }

  if (localResumes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">No resumes found. Upload resumes to manage them here.</p>
        <Button onClick={fetchResumes}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Manage Resumes</h2>
      <div className="flex justify-end mb-4">
        <Button onClick={fetchResumes} variant="outline" className="text-sm">
          Refresh Resumes
        </Button>
      </div>
      
      <div className="space-y-4">
        {localResumes.map((resume) => (
          <Card key={resume.id} className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
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
                Uploaded {formatRelativeDate(resume.upload_date || resume.uploadDate || new Date().toISOString())}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    {resume.status === "pending" ? (
                      "Your resume is being processed"
                    ) : (
                      <>
                        Match Score: 
                        <span className={`ml-2 font-bold ${
                          (resume.match_score || 0) > 70 ? "text-green-400" :
                          (resume.match_score || 0) > 50 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {resume.match_score !== undefined && resume.match_score !== null ? `${resume.match_score}%` : 'N/A'}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-white/20 hover:bg-white/10"
                    onClick={() => handleDownload(resume)}
                  >
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleDelete(resume.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 