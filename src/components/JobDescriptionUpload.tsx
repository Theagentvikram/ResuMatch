import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/config/api";

interface JobDescription {
  id: string;
  filename: string;
  summary: string;
  skills: string[];
  requirements: string[];
  experience: string;
  category: string;
}

interface JobDescriptionUploadProps {
  onJobDescriptionAnalyzed: (jd: JobDescription) => void;
  currentJD?: JobDescription | null;
}

export function JobDescriptionUpload({ onJobDescriptionAnalyzed, currentJD }: JobDescriptionUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
      });
      return;
    }

    setIsUploading(true);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/job-description/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job description');
      }

      const result = await response.json();
      onJobDescriptionAnalyzed(result);
      
      toast({
        title: "Job Description Analyzed",
        description: "Successfully extracted skills and requirements from the job description.",
      });
    } catch (error) {
      console.error('Error analyzing job description:', error);
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Failed to analyze job description. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) {
      toast({
        variant: "destructive",
        title: "No text provided",
        description: "Please enter job description text to analyze.",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/job-description/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job description text');
      }

      const result = await response.json();
      onJobDescriptionAnalyzed(result);
      
      toast({
        title: "Job Description Analyzed",
        description: "Successfully extracted skills and requirements from the job description text.",
      });
    } catch (error) {
      console.error('Error analyzing job description text:', error);
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Failed to analyze job description text. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearJobDescription = () => {
    onJobDescriptionAnalyzed(null as any);
    setTextInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (currentJD) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">Job Description Analysis</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearJobDescription}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-1">File</h4>
              <p className="text-sm">{currentJD.filename}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-1">Summary</h4>
              <p className="text-sm">{currentJD.summary}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {currentJD.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Experience Required</h4>
                <p className="text-sm">{currentJD.experience}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Category</h4>
                <p className="text-sm">{currentJD.category}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Upload Job Description</CardTitle>
        <p className="text-sm text-gray-600">
          Upload a PDF, Word document, or paste text to extract required skills and qualifications
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={uploadMode === "file" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadMode("file")}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload File
            </Button>
            <Button
              variant={uploadMode === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadMode("text")}
            >
              <FileText className="h-4 w-4 mr-1" />
              Paste Text
            </Button>
          </div>

          {uploadMode === "file" ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium">Click to upload job description</p>
                  <p className="text-xs text-gray-500">PDF, Word, or text files supported</p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  size="sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Choose File"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Paste your job description here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <Button
                onClick={handleTextAnalysis}
                disabled={isAnalyzing || !textInput.trim()}
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Text"
                )}
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Analyzing job description...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
