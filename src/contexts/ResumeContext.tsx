import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Resume, SearchResult } from "@/types";
import { mockResumes, searchResumes } from "@/lib/mockData";
import { useToast } from "@/components/ui/use-toast";
import { getUserResumes, searchResumesApi } from "@/lib/api";

// Local storage key for resumes
const RESUMES_STORAGE_KEY = "resumatch_user_resumes";

interface ResumeContextType {
  resumes: Resume[];
  setResumes: (resumes: Resume[]) => void;
  addResume: (resume: Resume) => void;
  deleteResume: (id: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchQuery: string;
  search: (query: string, searchType: "ai_analysis" | "resume_matching") => Promise<void>;
  clearSearch: () => void;
  loadUserResumes: () => Promise<void>;
  isLoading: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Load resumes from localStorage on mount
  useEffect(() => {
    const storedResumes = localStorage.getItem(RESUMES_STORAGE_KEY);
    if (storedResumes) {
      try {
        setResumes(JSON.parse(storedResumes));
      } catch (error) {
        console.error("Error parsing stored resumes:", error);
      }
    }
    // If no stored resumes, load from API
    else {
      loadUserResumes();
    }
  }, []);
  
  // Save resumes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(RESUMES_STORAGE_KEY, JSON.stringify(resumes));
  }, [resumes]);

  const loadUserResumes = async () => {
    setIsLoading(true);
    try {
      const userResumes = await getUserResumes();
      setResumes(userResumes);
    } catch (error) {
      console.error("Failed to load user resumes:", error);
      toast({
        title: "Failed to load resumes",
        description: "There was an error loading your resumes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addResume = (resume: Resume) => {
    // If resume with same ID exists, replace it
    const exists = resumes.some(r => r.id === resume.id);
    
    if (exists) {
      setResumes(prev => prev.map(r => r.id === resume.id ? resume : r));
    } else {
      setResumes(prev => [...prev, resume]);
    }
    
    // Save to localStorage immediately
    const updatedResumes = exists 
      ? resumes.map(r => r.id === resume.id ? resume : r)
      : [...resumes, resume];
    localStorage.setItem(RESUMES_STORAGE_KEY, JSON.stringify(updatedResumes));
    
    console.log("Resume added to context and localStorage:", resume);
    
    toast({
      title: "Resume added",
      description: `${resume.name} has been added to your collection.`,
    });
  };

  const deleteResume = (id: string) => {
    setResumes(prev => prev.filter((resume) => resume.id !== id));
    toast({
      title: "Resume deleted",
      description: "The resume has been removed from your collection.",
    });
  };

  const search = async (query: string, searchType: "ai_analysis" | "resume_matching") => {
    setIsSearching(true);
    setSearchQuery(query);
    try {
      console.log("ResumeContext: Starting search for query:", query);
      
      // Use the API search if available, otherwise use local mock
      const results = await searchResumesApi(query, searchType);
      console.log("ResumeContext: Search results received:", results);
      
      // Ensure we have valid results
      if (Array.isArray(results)) {
        setSearchResults(results);
        
        if (results.length === 0) {
          toast({
            title: "No matches found",
            description: "Try a different search query or upload more resumes.",
            variant: "destructive",
          });
        }
      } else {
        console.error("Invalid search results format:", results);
        setSearchResults([]);
        toast({
          title: "Search failed",
          description: "Received invalid search results. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "There was an error processing your search. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  const value = {
    resumes,
    setResumes,
    addResume,
    deleteResume,
    searchResults,
    isSearching,
    searchQuery,
    search,
    clearSearch,
    loadUserResumes,
    isLoading,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumes() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResumes must be used within a ResumeProvider");
  }
  return context;
}
