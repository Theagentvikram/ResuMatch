import React, { useState, useEffect } from 'react';
import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "../hooks/use-toast";
import { API_BASE_URL } from '../config/api';
import { motion } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Users, 
  Search,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  Briefcase,
  Plus
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

const JobListingsManagementPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/all`);
      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      } else {
        // Fallback to regular endpoint if /all doesn't exist
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/jobs`);
        if (fallbackResponse.ok) {
          const jobsData = await fallbackResponse.json();
          setJobs(jobsData);
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job listings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setJobs(jobs.filter(job => job.id !== jobId));
        toast({
          title: "Success",
          description: "Job posting deleted successfully",
        });
      } else {
        throw new Error('Failed to delete job posting');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job posting",
        variant: "destructive",
      });
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        ));
        toast({
          title: "Success",
          description: `Job posting ${newStatus.toLowerCase()}`,
        });
      } else {
        throw new Error('Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-300">Loading job listings...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center p-2 mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full"
          >
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full"
            >
              <Briefcase className="h-6 w-6 text-white" />
            </motion.div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Manage Job Listings
            </span>
          </h1>
          <p className="text-gray-300">
            Manage your job postings, edit details, and track applications
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search job listings by title, company, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50"
              />
            </div>
            <Button
              onClick={() => window.location.href = '/recruiter/post-job'}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>

          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl text-white">{job.title}</CardTitle>
                        <Badge 
                          variant={job.status === 'Active' ? 'default' : 'secondary'}
                          className={
                            job.status === 'Active' 
                              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4 text-blue-400" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 w-4 text-orange-400" />
                          <span>{job.experienceLevel}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {job.salary && (
                      <div className="flex items-center space-x-1 text-green-400 font-medium">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300 line-clamp-2">{job.description}</p>
                    
                    {job.skills && job.skills.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-white">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 8).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300">{skill}</Badge>
                          ))}
                          {job.skills.length > 8 && (
                            <Badge variant="outline" className="border-gray-500/30 text-gray-400">
                              +{job.skills.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {job.applicationDeadline && (
                      <div className="flex items-center space-x-1 text-sm text-gray-300">
                        <Calendar className="w-4 h-4 text-red-400" />
                        <span>Application Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                        className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                      >
                        {selectedJob?.id === job.id ? 'Hide Details' : 'View Details'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => toggleJobStatus(job.id, job.status)}
                        className={`border-white/20 hover:bg-white/10 ${
                          job.status === 'Active' 
                            ? 'text-yellow-300 hover:text-yellow-200' 
                            : 'text-green-300 hover:text-green-200'
                        }`}
                      >
                        {job.status === 'Active' ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        onClick={() => deleteJob(job.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>

                    {/* Job Details Section */}
                    {selectedJob?.id === job.id && (
                      <div className="mt-6 p-4 bg-black/20 backdrop-blur-md rounded-lg border border-white/10">
                        <h4 className="font-medium mb-4 text-white">Job Details</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium mb-2 text-gray-300">Full Description</h5>
                            <p className="text-sm text-gray-400">{job.description}</p>
                          </div>

                          {job.requirements.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2 text-gray-300">Requirements</h5>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                                {job.requirements.map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {job.benefits && job.benefits.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2 text-gray-300">Benefits</h5>
                              <div className="flex flex-wrap gap-2">
                                {job.benefits.map((benefit, index) => (
                                  <Badge key={index} variant="outline" className="border-purple-500/30 text-purple-300">{benefit}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No job listings found</h3>
                <p className="text-gray-300 mb-4">
                  {searchTerm ? `No job listings match your search for "${searchTerm}"` : 'You haven\'t posted any jobs yet'}
                </p>
                <Button
                  onClick={() => window.location.href = '/recruiter/post-job'}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobListingsManagementPage;
