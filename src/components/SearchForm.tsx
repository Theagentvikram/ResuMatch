import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useResumes } from "@/contexts/ResumeContext";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { JobDescriptionUpload } from "./JobDescriptionUpload";

interface JobDescription {
  id: string;
  filename: string;
  summary: string;
  skills: string[];
  requirements: string[];
  experience: string;
  category: string;
}

interface SearchFormProps {
  onJobDescriptionUpdate?: (skills: string[]) => void;
}

export function SearchForm({ onJobDescriptionUpdate }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const { search } = useResumes();
  const { toast } = useToast();

  const handleJobDescriptionAnalyzed = (jd: JobDescription | null) => {
    setJobDescription(jd);
    if (jd && onJobDescriptionUpdate) {
      onJobDescriptionUpdate(jd.skills);
    }
    if (jd) {
      // Auto-populate the search query with job description summary
      const autoQuery = `Looking for ${jd.category} with ${jd.experience} experience in ${jd.skills.slice(0, 3).join(', ')}`;
      setQuery(autoQuery);
    }
  };

  const handleSearchTriggered = async (query: string, searchType: "ai_analysis" | "resume_matching") => {
    setQuery(query);
    setSearchError(null);
    
    try {
      console.log("Auto-triggered search query:", query);
      await search(query, searchType);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("There was an error processing your search. Please try again.");
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "There was an error processing your search. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Job Description Upload */}
      <JobDescriptionUpload
        onJobDescriptionAnalyzed={handleJobDescriptionAnalyzed}
        currentJD={jobDescription}
        onSearchTriggered={handleSearchTriggered}
      />
      
      {searchError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}
      
      {jobDescription && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-2">
              <strong>Auto-generated search:</strong> {query}
            </div>
            <div className="text-xs text-gray-500">
              Results are automatically generated based on your job description analysis.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
