import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "../hooks/use-toast";
import { API_BASE_URL } from '../config/api';
import SuggestionsModal from '../components/SuggestionsModal';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Users, 
  Search,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PersonalizedSuggestion {
  skillsToAdd: string[];
  skillsToRemove: string[];
  recommendations: string[];
  overallScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
}

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary?: string;
  benefits?: string[];
  applicationDeadline?: string;
  postedDate: string;
  status: string;
}

interface Resume {
  id: string;
  filename: string;
  skills: string[];
  summary: string;
  experience: string;
  educationLevel: string;
  category: string;
}

interface ResumeJobMatch {
  jobId: string;
  resumeId: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  overallAssessment: string;
}

const JobPortalPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [matches, setMatches] = useState<Record<string, ResumeJobMatch[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showMatches, setShowMatches] = useState<string | null>(null);
  const [loadingMatches, setLoadingMatches] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState<string | null>(null);
  const [suggestionsModal, setSuggestionsModal] = useState<{
    isOpen: boolean;
    suggestions: PersonalizedSuggestion | null;
    resumeFilename?: string;
    jobTitle?: string;
  }>({
    isOpen: false,
    suggestions: null,
  });

  useEffect(() => {
    loadJobs();
    loadResumes();
    // Auto-refresh every 30 seconds to keep data fresh
    const interval = setInterval(() => {
      loadJobs();
      loadResumes();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Remove auto-calculation - only calculate when user clicks "Check My Resume Matches"

  const loadJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`);
      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job listings",
        variant: "destructive",
      });
    }
  };

  const loadResumes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/user`);
      if (response.ok) {
        const resumesData = await response.json();
        setResumes(resumesData);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkResumeMatches = async (jobId: string) => {
    try {
      setLoadingMatches(jobId);
      setShowMatches(jobId);
      
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/match-resumes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: "current-user" }),
      });
      
      if (response.ok) {
        const matchData = await response.json();
        setMatches(prev => ({
          ...prev,
          [jobId]: matchData
        }));
      } else {
        throw new Error('Failed to fetch matches');
      }
    } catch (error) {
      console.error('Error checking matches:', error);
      toast({
        title: "Error",
        description: "Failed to check resume matches",
        variant: "destructive",
      });
      setShowMatches(null);
    } finally {
      setLoadingMatches(null);
    }
  };

  const getPersonalizedSuggestions = async (resumeId: string, jobId: string) => {
    try {
      setLoadingSuggestions(`${resumeId}-${jobId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/personalized-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobId }),
      });
      
      if (response.ok) {
        const suggestions = await response.json();
        const resume = resumes.find(r => r.id === resumeId);
        const job = jobs.find(j => j.id === jobId);
        
        // Open the suggestions modal with proper data structure
        setSuggestionsModal({
          isOpen: true,
          suggestions: {
            skillsToAdd: suggestions.skillsToAdd || [],
            skillsToRemove: suggestions.skillsToRemove || [],
            recommendations: suggestions.recommendations || [],
            overallScore: 75, // Default score since backend doesn't return this yet
            strengthAreas: [], // Will be enhanced later
            improvementAreas: suggestions.skillsToAdd || []
          },
          resumeFilename: resume?.filename,
          jobTitle: job?.title
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        toast({
          title: "Error",
          description: errorData.detail || "Failed to get personalized suggestions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to get personalized suggestions",
        variant: "destructive",
      });
    } finally {
      setLoadingSuggestions(null);
    }
  };

  const getMatchIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle className="w-5 h-5 text-orange-600" />;
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading job opportunities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Portal</h1>
        <p className="text-gray-600">Find your perfect job match and get personalized resume suggestions</p>
      </div>

      {resumes.length === 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                You haven't uploaded any resumes yet. <a href="/upload" className="underline">Upload a resume</a> to see personalized job matches and suggestions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search jobs by title, company, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{job.experienceLevel}</span>
                    </div>
                  </div>
                </div>
                {job.salary && (
                  <div className="flex items-center space-x-1 text-green-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 line-clamp-3">{job.description}</p>
                
                <div>
                  <h4 className="font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {job.benefits && job.benefits.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((benefit, index) => (
                        <Badge key={index} variant="outline">{benefit}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.applicationDeadline && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Apply by: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  >
                    {selectedJob?.id === job.id ? 'Hide Details' : 'View Details'}
                  </Button>
                  
                  {resumes.length > 0 && (
                    <Button
                      onClick={() => checkResumeMatches(job.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={loadingMatches === job.id}
                    >
                      {loadingMatches === job.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking Matches...
                        </>
                      ) : (
                        'Check My Resume Matches'
                      )}
                    </Button>
                  )}
                </div>

                {/* Resume Matches Section */}
                {showMatches === job.id && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    {loadingMatches === job.id ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-gray-600">Analyzing your resumes for this job...</span>
                      </div>
                    ) : matches[job.id] ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Resume Match Analysis</h4>
                          <p className="text-sm text-gray-600">
                            Which of your resumes fits this job better?
                          </p>
                        </div>
                        <div className="space-y-3">
                          {matches[job.id]
                            .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score, best first
                            .map((match, index) => {
                              const resume = resumes.find(r => r.id === match.resumeId);
                              if (!resume) return null;
                              
                              return (
                                <div key={match.resumeId} className={`bg-white p-4 rounded border-2 ${
                                  index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                }`}>
                                  {index === 0 && (
                                    <div className="flex items-center mb-2">
                                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                                      <span className="text-xs font-medium text-green-700 uppercase tracking-wide">
                                        Best Match
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      {getMatchIcon(match.matchScore)}
                                      <div>
                                        <h5 className="font-medium">{resume.filename}</h5>
                                        <p className="text-sm text-gray-600">{resume.category} • {resume.experience} years experience</p>
                                      </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(match.matchScore)}`}>
                                      {match.matchScore}% Match
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                    <div>
                                      <span className="font-medium text-green-600">Matching Skills ({match.matchingSkills.length}):</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {match.matchingSkills.slice(0, 8).map((skill, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                        {match.matchingSkills.length > 8 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{match.matchingSkills.length - 8} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <span className="font-medium text-red-600">Missing Skills ({match.missingSkills.length}):</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {match.missingSkills.slice(0, 5).map((skill, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                        {match.missingSkills.length > 5 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{match.missingSkills.length - 5} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-sm text-gray-700 mb-3 p-3 bg-gray-50 rounded">
                                    <strong>AI Assessment:</strong> {match.overallAssessment}
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => getPersonalizedSuggestions(resume.id, job.id)}
                                    disabled={loadingSuggestions === `${resume.id}-${job.id}`}
                                    className="w-full"
                                  >
                                    {loadingSuggestions === `${resume.id}-${job.id}` ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating Suggestions...
                                      </>
                                    ) : (
                                      'Get Personalized Suggestions for This Resume'
                                    )}
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                        
                        {matches[job.id].length > 1 && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>Recommendation:</strong> Use your <strong>
                                {resumes.find(r => r.id === matches[job.id].sort((a, b) => b.matchScore - a.matchScore)[0].resumeId)?.filename}
                              </strong> resume for this application as it has the highest match score.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-600">
                        No matches found. Please try again.
                      </div>
                    )}
                  </div>
                )}

                {/* Job Details Section */}
                {selectedJob?.id === job.id && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-4">Job Details</h4>
                    
                    {job.requirements.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Requirements</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <p>Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
                      <p>Status: <span className="text-green-600 font-medium">{job.status}</span></p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {searchTerm ? `No jobs match your search for "${searchTerm}"` : 'No job postings available at the moment'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Suggestions Modal */}
      <SuggestionsModal
        isOpen={suggestionsModal.isOpen}
        onClose={() => setSuggestionsModal({ isOpen: false, suggestions: null })}
        suggestions={suggestionsModal.suggestions}
        resumeFilename={suggestionsModal.resumeFilename}
        jobTitle={suggestionsModal.jobTitle}
      />
    </div>
  );
};

export default JobPortalPage;
