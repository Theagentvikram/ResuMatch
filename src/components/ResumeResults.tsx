import { useState } from "react";
import { useResumes } from "@/contexts/ResumeContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCheck, Download, FileText, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Resume } from "@/types";

export function ResumeResults() {
  const { searchResults, isSearching, searchQuery } = useResumes();
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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
                    <Badge key={skill} variant="outline" className="bg-brand-gray">
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
                      <p className="mt-1 text-gray-600 text-sm">Score source: {result.scoreSource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    )}
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
                  <Button size="sm" className="gap-1">
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
            <DialogTitle>{selectedResume?.originalName.replace(".pdf", "")}</DialogTitle>
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
                <Button>
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
