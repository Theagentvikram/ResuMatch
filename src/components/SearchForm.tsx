import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResumes } from "@/contexts/ResumeContext";
import { Search, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  searchType: "ai_analysis" | "resume_matching";
  onJobDescriptionUpdate?: (skills: string[]) => void;
}

export function SearchForm({ searchType, onJobDescriptionUpdate }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const { search, isSearching } = useResumes();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    
    if (query.trim()) {
      try {
        console.log("Submitting search query:", query);
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
      
      <Card>
        <CardContent className="pt-6">
          {searchError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Describe the candidate you're looking for..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching || !query.trim()}>
              {isSearching ? (
                "Searching..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
