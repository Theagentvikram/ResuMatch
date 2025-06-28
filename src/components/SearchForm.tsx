import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResumes } from "@/contexts/ResumeContext";
import { Search, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

interface SearchFormProps {
  searchType: "ai_analysis" | "resume_matching";
}

export function SearchForm({ searchType }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const { search, isSearching } = useResumes();
  const { toast } = useToast();

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

  const placeholderQueries = [
    "Python developer with 2+ years experience",
    "Frontend engineer with React skills",
    "Data scientist with machine learning background",
    "Software engineer with JavaScript experience"
  ];

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    search(sampleQuery, searchType);
  };

  return (
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
        
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Try sample queries:</p>
          <div className="flex flex-wrap gap-2">
            {placeholderQueries.map((sampleQuery) => (
              <Button
                key={sampleQuery}
                variant="outline"
                size="sm"
                onClick={() => handleSampleQuery(sampleQuery)}
                className="text-xs"
              >
                {sampleQuery}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
