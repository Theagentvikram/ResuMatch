import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Upload, FileText, X, Plus, ArrowRight, Brain, Clock } from "lucide-react";
import { useResumes } from "@/contexts/ResumeContext";
import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { uploadResume, analyzeUserResume, getModelStatus } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ModelStatus = {
  status: string;
  message: string;
  using_fallback: boolean;
}

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [newSkill, setNewSkill] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addResume, loadUserResumes } = useResumes();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [modelInfo, setModelInfo] = useState<{ status: string; message: string; mode: string } | null>(null);

  useEffect(() => {
    // Check ML model status when component loads
    const checkModelStatus = async () => {
      setIsLoadingStatus(true);
      try {
        // Use the getModelStatus function from the API
        const status = await getModelStatus();
        setModelStatus(status);
        setModelInfo(status); // Set modelInfo with the same data
        console.log("Model status from API:", status);
        
        // Log success for debugging
        if (status.status === "available") {
          console.log("✅ OpenRouter API is available and ready to use");
        } else {
          console.warn("⚠️ OpenRouter API is not available, using fallback mode:", status.mode);
        }
      } catch (error) {
        console.error('Failed to check model status:', error);
        // Set default error status
        const errorStatus = {
          status: "error",
          message: "Ready for AI Analysis",
          using_fallback: true,
          mode: "pattern"
        };
        setModelStatus(errorStatus);
        setModelInfo(errorStatus);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    
    checkModelStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    
    if (selectedFile) {
      // Check file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, Word document, or text file.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size should be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Create file preview URL
      const fileURL = URL.createObjectURL(selectedFile);
      setFilePreview(fileURL);
      
      // Reset form fields
      setSummary("");
      setSkills([]);
      setExperience("");
      setEducationLevel("");
      setCategory("");
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSummary("");
    setSkills([]);
    setExperience("");
    setEducationLevel("");
    setCategory("");
    setShowSuccessMessage(false);
  };

  const handleGenerateSummary = async () => {
    if (!file) return;

    setIsGeneratingSummary(true);
    setUploadProgress(0);
    
    try {
      console.log("Starting resume analysis for:", file.name);
      
      // Add a realistic progress simulation
      const progressUpdateInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressUpdateInterval);
            return 95;
          }
          
          // Slow down progress as we get higher
          const increment = prev < 50 ? 10 : prev < 80 ? 5 : 2;
          return Math.min(prev + increment, 95);
        });
      }, 500);
      
      // Start timing the processing
      const startTime = Date.now();
      
      // Process the resume - use analyzeUserResume instead of analyzeResume
      // to ensure we're properly sending the file to the backend
      console.log("Calling analyzeUserResume with file:", file.name);
      const result = await analyzeUserResume(file);
      
      // Log the complete results for debugging
      console.log("Raw analysis result:", JSON.stringify(result, null, 2));
      console.log("Result type:", typeof result);
      console.log("Result properties:");
      console.log("- summary:", result.summary, typeof result.summary);
      console.log("- skills:", result.skills, Array.isArray(result.skills));
      console.log("- experience:", result.experience, typeof result.experience);
      console.log("- educationLevel:", result.educationLevel, typeof result.educationLevel);
      console.log("- category:", result.category, typeof result.category);
      
      // Ensure minimum 3 seconds of processing time for UX purposes
      const processingTime = Date.now() - startTime;
      if (processingTime < 3000) {
        await new Promise(resolve => setTimeout(resolve, 3000 - processingTime));
      }
      
      // Complete the progress bar
      clearInterval(progressUpdateInterval);
      setUploadProgress(100);
      
      if (result) {
        console.log("Analysis result:", result);
        
        // Check if result contains error messages
        const hasErrors = result.summary && (
          result.summary.toLowerCase().includes("error") || 
          result.summary.includes("failed") ||
          result.summary.includes("⚠️ MOCK DATA") ||
          result.skills.some((skill: string) => skill.includes("Error")) ||
          result.category === "Error"
        );
        
        // Determine the kind of error for better user feedback
        let errorType = "general";
        if (result.summary.includes("file format")) errorType = "format";
        else if (result.summary.includes("timed out")) errorType = "timeout";
        else if (result.summary.includes("backend")) errorType = "backend";
        
        // Update UI with results
        console.log("Updating UI with analysis results");
        console.log("Setting summary to:", result.summary);
        setSummary(result.summary);
        
        console.log("Setting skills to:", result.skills?.filter((s: string) => !s.includes("Error")) || []);
        setSkills(result.skills?.filter((s: string) => !s.includes("Error")) || []);
        
        console.log("Setting experience to:", result.experience?.toString() || "0");
        setExperience(result.experience?.toString() || "0");
        
        console.log("Setting educationLevel to:", result.educationLevel || "");
        setEducationLevel(result.educationLevel || "");
        
        console.log("Setting category to:", result.category || "");
        setCategory(result.category || "");
        
        // Debug check if state is being updated
        setTimeout(() => {
          console.log("State after update:");
          console.log("- summary:", summary);
          console.log("- skills:", skills);
          console.log("- experience:", experience);
          console.log("- educationLevel:", educationLevel);
          console.log("- category:", category);
        }, 100);
        
        // Show appropriate notification based on result
        if (hasErrors) {
          const errorMessages = {
            format: "The file format couldn't be processed. Please use a standard PDF file.",
            timeout: "The file took too long to process. Try a simpler or smaller file.",
            backend: "The analysis server is not responding. Please try again later.",
            general: "There was an issue analyzing your resume. Please check the details and try again."
          };
          
      toast({
            title: "Analysis Issue",
            description: errorMessages[errorType as keyof typeof errorMessages],
        variant: "destructive",
      });
        } else {
          toast({
            title: "Summary Generated",
            description: `Successfully analyzed your resume: ${file.name.slice(0, 30)}${file.name.length > 30 ? '...' : ''}`,
          });
        }
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      
      // Set error information in the summary field
      setSummary(`Error analyzing resume: ${error instanceof Error ? error.message : "Unknown error"}. Please try a different file.`);
      
      toast({
        title: "Analysis Failed",
        description: "There was an error processing your resume. Please try a different file format.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) clearInterval(progressInterval);
        return Math.min(prev + 5, 95);
      });
    }, 100);
    
    try {
      console.log("Starting resume upload for:", file.name);
      
      // Ensure we have necessary fields
      if (!summary) {
        throw new Error("Please generate a summary before uploading");
      }
      
      // Upload the resume and get the data
      const resumeData = await uploadResume(file, {
        summary,
        skills,
        experience,
        educationLevel,
        category
      });
      
      console.log("Upload result:", resumeData);
      
      // Add the resume to the context
      if (resumeData) {
        addResume(resumeData);
        setUploadProgress(100);
        setShowSuccessMessage(true);
        
        // Check if we received mock data
        if (resumeData.summary && resumeData.summary.includes("MOCK DATA")) {
          toast({
            title: "Using Mock Upload",
            description: "We could not connect to the upload service. Using fallback upload.",
            variant: "destructive",
          });
        } else {
      toast({
            title: "Resume Uploaded",
            description: "Your resume has been successfully uploaded!",
          });
        }
        
        // Clear the form
        clearFile();
        
        // Dispatch a custom event to notify that a resume was uploaded
        const resumeUploadedEvent = new Event('resumeUploaded');
        window.dispatchEvent(resumeUploadedEvent);
        console.log("Dispatched resumeUploaded event");
        
        // Navigate to the upload status page immediately
        navigate("/upload-status?new=true");
        
        // Show a success toast
        toast({
          title: "Resume Uploaded",
          description: "Your resume has been uploaded and is being processed.",
        });
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Upload Failed",
        description: `There was an error uploading your resume: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl backdrop-blur-sm bg-white/10 shadow-xl border-t border-l border-white/20 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <CardHeader className="space-y-1 relative z-10">
        <CardTitle className="text-2xl font-bold text-center text-white">Upload Your Resume</CardTitle>
        <CardDescription className="text-center text-gray-300">
          Upload your resume and our AI will analyze it for better matching
        </CardDescription>
        {modelInfo && (
          <div className="mt-2 flex items-center justify-center gap-2 text-sm">
            <Badge variant="outline" className={'bg-green-900/30 text-green-400 border-green-800'}>
              <Brain className="h-3 w-3 mr-1" />
              {modelInfo.mode === 'llama_cpp' ? 'Local LLM' : 
               modelInfo.mode === 'offline' ? 'Offline AI' : 
               modelInfo.mode === 'api' ? 'Cloud AI' : 
               modelInfo.mode === 'regex' ? 'AI Analysis' : 'AI Analysis'}
            </Badge>
            <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-2">
              {modelInfo && modelInfo.status === "error" && (
                <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {modelInfo.mode === "pattern" ? "AI Analysis" : modelInfo.mode === "mock" ? "Mock Embeddings" : modelInfo.mode}
                </Badge>
              )}
              {isLoadingStatus ? "Checking analysis service..." : modelInfo?.message}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {!file ? (
              <motion.div 
                className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors duration-300"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px -8px rgba(59, 130, 246, 0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Drag and drop your resume or click to browse</h3>
                <p className="text-sm text-gray-400 mt-2">Accepts PDF, Word, or plain text files</p>
                <Input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx,.txt"
                />
              </motion.div>
            ) : (
              <motion.div 
                className="flex flex-col items-center justify-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between w-full p-4 border border-white/20 rounded-lg bg-white/10">
                  <div className="flex items-center">
                    {filePreview && (
                      <div className="h-12 w-12 mr-4 flex-shrink-0">
                        <img src={filePreview} alt="File preview" className="h-full w-full object-contain" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-white">{file.name}</h4>
                      <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    onClick={clearFile} 
                    className="text-gray-400 hover:text-white hover:bg-red-900/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {!summary && !isGeneratingSummary && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full"
                  >
                    <Button
                      type="button"
                      onClick={handleGenerateSummary}
                      className="w-full relative overflow-hidden group/button bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90 transition-all duration-300 gap-2"
                      disabled={isGeneratingSummary}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300 blur-lg"></div>
                      <div className="relative z-10 flex items-center">
                        {isGeneratingSummary ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" /> Analyze with AI
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                )}
                
                {isGeneratingSummary && (
                  <div className="w-full space-y-2">
                    <p className="text-gray-300 text-center">Analyzing your resume...</p>
                    <Progress value={uploadProgress} className="h-2 bg-white/10" />
                  </div>
                )}
                
                <AnimatePresence>
                  {summary && (
                    <motion.div 
                      className="space-y-4 w-full"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="summary" className="text-white">Resume Summary</Label>
                        <Textarea 
                          id="summary" 
                          value={summary} 
                          onChange={(e) => setSummary(e.target.value)} 
                          className="min-h-[100px] bg-white/10 text-white placeholder:text-gray-200 border-white/20 focus:bg-white/20"
                          placeholder="AI generated summary of your resume"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="skills" className="text-white">Skills</Label>
                        <div className="flex flex-wrap gap-2 p-2 min-h-[60px] bg-white/10 rounded-md border border-white/20">
                          {skills.map(skill => (
                            <div 
                              key={skill} 
                              className="flex items-center gap-1 bg-blue-600/30 text-white px-2 py-1 rounded-md text-sm"
                            >
                              <span>{skill}</span>
                              <button 
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="text-white/70 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <div className="flex items-center">
                            <Input
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                              placeholder="Add skill"
                              className="h-8 bg-transparent border-none text-white placeholder:text-gray-200 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 w-[120px]"
                            />
                            <Button 
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={addSkill}
                              className="h-8 w-8 p-0 text-white"
                              disabled={!newSkill.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                          <Label htmlFor="experience" className="text-white">Experience Level</Label>
                  <Input
                            id="experience" 
                            value={experience} 
                            onChange={(e) => setExperience(e.target.value)} 
                            className="bg-white/10 text-white placeholder:text-gray-200 border-white/20 focus:bg-white/20"
                            placeholder="Years of experience"
                  />
                </div>
                        <div className="space-y-2">
                          <Label htmlFor="education" className="text-white">Education Level</Label>
                          <Input 
                            id="education" 
                            value={educationLevel} 
                            onChange={(e) => setEducationLevel(e.target.value)} 
                            className="bg-white/10 text-white placeholder:text-gray-200 border-white/20 focus:bg-white/20"
                            placeholder="Highest degree"
                          />
            </div>
          </div>

          <div className="space-y-2">
                        <Label htmlFor="category" className="text-white">Job Category</Label>
                        <Input 
                          id="category" 
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)} 
                          className="bg-white/10 text-white placeholder:text-gray-200 border-white/20 focus:bg-white/20"
                          placeholder="e.g. Software Engineering, Marketing, etc."
                        />
          </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full relative overflow-hidden group/button bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90 transition-all duration-300 gap-2"
                          disabled={isUploading}
                        >
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300 blur-lg"></div>
                          <div className="relative z-10 flex items-center">
                            {isUploading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" /> Upload Resume
                              </>
                            )}
            </div>
                        </Button>
                      </motion.div>

          {isUploading && (
                        <div className="w-full space-y-2">
                          <Progress value={uploadProgress} className="h-2 bg-white/10" />
                          <p className="text-gray-300 text-center text-sm">{uploadProgress}% complete</p>
            </div>
          )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {showSuccessMessage && (
                    <motion.div 
                      className="flex flex-col items-center justify-center space-y-2 p-4 bg-green-900/20 border border-green-500/30 rounded-lg w-full"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <p className="text-white font-medium">Resume Uploaded Successfully!</p>
                      <p className="text-gray-300 text-sm text-center">
                        Your resume has been uploaded and is now available in your profile.
                      </p>
          <Button
                        variant="link" 
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                        onClick={clearFile}
                      >
                        <span>Continue to Dashboard</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/10 pt-4 relative z-10">
        <p className="text-sm text-gray-300">
          Upload files up to 5MB. We support PDF, Word, and plain text formats.
        </p>
      </CardFooter>
    </Card>
  );
}
