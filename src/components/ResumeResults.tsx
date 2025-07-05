import { useState } from "react";
import { useResumes } from "@/contexts/ResumeContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCheck, Download, FileText, Loader2, Brain, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Resume } from "@/types";
import { API_BASE_URL } from "@/config/api";
import { useToast } from "@/components/ui/use-toast";

interface ResumeResultsProps {
  jobDescriptionSkills?: string[];
}

export function ResumeResults({ jobDescriptionSkills = [] }: ResumeResultsProps) {
  const { searchResults, isSearching, searchQuery } = useResumes();
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<{ [key: string]: string }>({});
  const [loadingAI, setLoadingAI] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  
  // Check if a skill is matched with job description
  const isSkillMatched = (skill: string) => {
    if (!jobDescriptionSkills.length) return false;
    return jobDescriptionSkills.some(jdSkill => 
      skill.toLowerCase().includes(jdSkill.toLowerCase()) || 
      jdSkill.toLowerCase().includes(skill.toLowerCase())
    );
  };

  // Get AI suggestions for a resume
  const getAISuggestions = async (resume: Resume) => {
    const resumeId = resume.id;
    setLoadingAI(prev => ({ ...prev, [resumeId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeSkills: resume.skills,
          jobDescriptionSkills: jobDescriptionSkills,
          resumeSummary: resume.summary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const { suggestions } = await response.json();
      setAiSuggestions(prev => ({ ...prev, [resumeId]: suggestions }));
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      
      // Fallback to mock suggestions
      const missingSkills = jobDescriptionSkills.filter(jdSkill => 
        !resume.skills.some(rSkill => 
          rSkill.toLowerCase().includes(jdSkill.toLowerCase()) || 
          jdSkill.toLowerCase().includes(rSkill.toLowerCase())
        )
      );
      
      const mockSuggestions = missingSkills.length > 0 
        ? `Based on the job description, this candidate has strong skills in ${resume.skills.slice(0, 3).join(', ')}. However, they might benefit from adding experience with ${missingSkills.slice(0, 3).join(', ')} which are mentioned in the job requirements. These skills could enhance their profile for this specific role.`
        : `This candidate has excellent skill alignment with the job description. Their expertise in ${resume.skills.slice(0, 3).join(', ')} makes them a strong match for this position.`;
      
      setAiSuggestions(prev => ({ ...prev, [resumeId]: mockSuggestions }));
      
      toast({
        title: "AI Suggestions Generated",
        description: "Using demo AI analysis - backend not available.",
      });
    } finally {
      setLoadingAI(prev => ({ ...prev, [resumeId]: false }));
    }
  };

  // Download resume function
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
      link.download = resume.filename || resume.name || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: `${resume.filename} has been downloaded successfully.`,
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

  // Log search results for debugging
  console.log("Search results in component:", searchResults);

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue mb-4" />
        <p className="text-lg font-medium">Searching for matching resumes...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Our AI is analyzing resumes based on your query
        </p>
      </div>
    );
  }

  if (searchResults.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
        <p className="text-lg font-medium">No matching resumes found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your search query or uploading more resumes
        </p>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return null;
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 10) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Top Matching Resumes
            <span className="ml-2 text-brand-blue">{searchResults.length}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Sorted by relevance to "{searchQuery}"
          </p>
        </div>

        <div className="space-y-4">
          {searchResults.map((result) => (
            <Card key={result.resume.id} className="resume-card fade-in">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {(result.resume.originalName || result.resume.filename || "Unknown Resume").replace(".pdf", "")}
                  </CardTitle>
                  <Badge variant="outline" className={cn("border px-2 py-1 font-medium", getMatchScoreColor(result.matchScore))}>
                    Match Score: {result.matchScore}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="mb-3">
                  <p className="text-sm">{result.resume.summary}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {result.resume.skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="outline" 
                      className={cn(
                        "transition-colors",
                        isSkillMatched(skill) 
                          ? "bg-green-100 text-green-800 border-green-300" 
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      )}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                {result.matchReason && (
                  <div className="mt-3 p-2 bg-blue-50 text-blue-700 rounded-md" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                    <div className="flex gap-1 items-center font-medium text-sm">
                      <CheckCheck className="h-3.5 w-3.5" />
                      Match reasons:
                    </div>
                    <p className="mt-1 text-sm whitespace-normal w-full break-words">{result.matchReason}</p>
                    {result.scoreSource && (
                      <p className="mt-1 text-gray-600 text-sm">Score source: {result.scoreSource.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                    )}
                  </div>
                )}

                {/* AI Suggestions Section */}
                {aiSuggestions[result.resume.id] && (
                  <div className="mt-3 p-3 bg-purple-50 text-purple-800 rounded-md border border-purple-200">
                    <div className="flex gap-1 items-center font-medium text-sm mb-2">
                      <Brain className="h-3.5 w-3.5" />
                      AI Suggestions:
                    </div>
                    <p className="text-sm leading-relaxed">{aiSuggestions[result.resume.id]}</p>
                  </div>
                )}
              </CardContent>
              <Separator />
              <CardFooter className="flex justify-between pt-3">
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="font-medium mr-1">Category:</span> {result.resume.category}
                  <span className="mx-2">•</span>
                  <span className="font-medium mr-1">Added:</span> {formatDate(result.resume.uploadDate)}
                  <span className="mx-2">•</span>
                  <span className="font-medium mr-1">Experience:</span> {result.resume.experience} years
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedResume(result.resume)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => getAISuggestions(result.resume)}
                    disabled={loadingAI[result.resume.id]}
                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    {loadingAI[result.resume.id] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        AI...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-1" />
                        AI Suggestions
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={() => downloadResume(result.resume)}
                  >
                    <Download className="h-4 w-4" /> Resume
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedResume} onOpenChange={(open) => !open && setSelectedResume(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedResume?.originalName?.replace(".pdf", "") || selectedResume?.filename?.replace(".pdf", "") || "Resume Details"}</DialogTitle>
            <DialogDescription>
              Complete resume details and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedResume && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Summary</h3>
                <p className="text-sm">{selectedResume.summary}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Category</h3>
                  <p className="text-sm">{selectedResume.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Experience</h3>
                  <p className="text-sm">{selectedResume.experience} years</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Education</h3>
                  <p className="text-sm">{selectedResume.educationLevel}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Uploaded</h3>
                  <p className="text-sm">{formatDate(selectedResume.uploadDate)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedResume.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="pt-2 flex justify-end">
                <Button onClick={() => selectedResume && downloadResume(selectedResume)}>
                  <Download className="h-4 w-4 mr-2" /> Download Resume
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
