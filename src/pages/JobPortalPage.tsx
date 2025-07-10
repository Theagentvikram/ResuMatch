import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "../hooks/use-toast";
import { API_BASE_URL } from '../config/api';
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
  XCircle
} from 'lucide-react';

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

  // Auto-calculate matches when jobs or resumes change
  useEffect(() => {
    if (jobs.length > 0 && resumes.length > 0) {
      autoCalculateMatches();
    }
  }, [jobs, resumes]);

  const autoCalculateMatches = async () => {
    // Calculate matches for all jobs automatically
    for (const job of jobs) {
      if (!matches[job.id]) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/match-resumes`, {
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
              [job.id]: matchData
            }));
          }
        } catch (error) {
          console.error(`Error calculating matches for job ${job.id}:`, error);
        }
      }
    }
  };

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
      setShowMatches(jobId);
      
      if (!matches[jobId]) {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/match-resumes`, {
          method: 'POST'
        });
        
        if (response.ok) {
          const matchData = await response.json();
          setMatches(prev => ({
            ...prev,
            [jobId]: matchData
          }));
        }
      }
    } catch (error) {
      console.error('Error checking matches:', error);
      toast({
        title: "Error",
        description: "Failed to check resume matches",
        variant: "destructive",
      });
    }
  };

  const getPersonalizedSuggestions = async (resumeId: string, jobId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/personalized-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobId),
      });
      
      if (response.ok) {
        const suggestions = await response.json();
        
        // Show suggestions in a toast or modal
        let message = "Resume Improvement Suggestions:\\n\\n";
        if (suggestions.skillsToAdd.length > 0) {
          message += `Skills to Add: ${suggestions.skillsToAdd.join(', ')}\\n`;
        }
        if (suggestions.skillsToRemove.length > 0) {
          message += `Consider Removing: ${suggestions.skillsToRemove.join(', ')}\\n`;
        }
        if (suggestions.recommendations.length > 0) {
          message += `\\nRecommendations:\\n${suggestions.recommendations.slice(0, 3).join('\\n')}`;
        }
        
        alert(message); // For now, using alert. In production, use a proper modal
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to get personalized suggestions",
        variant: "destructive",
      });
    }
  };

  const getMatchIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
                    >
                      Check My Resume Matches
                    </Button>
                  )}
                </div>

                {/* Resume Matches Section */}
                {showMatches === job.id && matches[job.id] && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-4">Your Resume Matches</h4>
                    <div className="space-y-3">
                      {matches[job.id].map((match) => {
                        const resume = resumes.find(r => r.id === match.resumeId);
                        if (!resume) return null;
                        
                        return (
                          <div key={match.resumeId} className="bg-white p-4 rounded border">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {getMatchIcon(match.matchScore)}
                                <div>
                                  <h5 className="font-medium">{resume.filename}</h5>
                                  <p className="text-sm text-gray-600">{resume.category}</p>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(match.matchScore)}`}>
                                {match.matchScore}% Match
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-green-600">Matching Skills:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {match.matchingSkills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-red-600">Missing Skills:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {match.missingSkills.slice(0, 5).map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <p className="text-sm text-gray-700 mb-2">{match.overallAssessment}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => getPersonalizedSuggestions(resume.id, job.id)}
                              >
                                Get Personalized Suggestions
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
    </div>
  );
};

export default JobPortalPage;
