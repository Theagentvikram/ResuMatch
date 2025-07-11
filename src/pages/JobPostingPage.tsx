import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "../hooks/use-toast";
import { API_BASE_URL } from '../config/api';
import { motion } from "framer-motion";
import { Plus, X, Briefcase } from 'lucide-react';

interface JobPostingForm {
  title: string;
  company: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary: string;
  benefits: string[];
  applicationDeadline: string;
}

const JobPostingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  
  const [formData, setFormData] = useState<JobPostingForm>({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: '',
    requirements: [],
    skills: [],
    salary: '',
    benefits: [],
    applicationDeadline: ''
  });

  const handleInputChange = (field: keyof JobPostingForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.company || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create job posting');
      }

      await response.json();
      
      toast({
        title: "Success!",
        description: `Job posting "${formData.title}" created successfully`,
      });

      // Navigate to the search page after successful job posting
      navigate('/search');

    } catch (error) {
      console.error('Error creating job posting:', error);
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              Post a New Job
            </span>
          </h1>
          <p className="text-gray-300">
            Create a job posting to attract the best candidates
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Job Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Senior Python Developer"
                      required
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Company *</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="e.g. TechCorp Solutions"
                      required
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Job Type</label>
                    <select
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white focus:border-purple-500/50"
                      value={formData.jobType}
                      onChange={(e) => handleInputChange('jobType', e.target.value)}
                    >
                      <option value="Full-time" className="bg-gray-800 text-white">Full-time</option>
                      <option value="Part-time" className="bg-gray-800 text-white">Part-time</option>
                      <option value="Contract" className="bg-gray-800 text-white">Contract</option>
                      <option value="Internship" className="bg-gray-800 text-white">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Experience Level</label>
                    <select
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white focus:border-purple-500/50"
                      value={formData.experienceLevel}
                      onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    >
                      <option value="Entry Level" className="bg-gray-800 text-white">Entry Level</option>
                      <option value="Mid Level" className="bg-gray-800 text-white">Mid Level</option>
                      <option value="Senior Level" className="bg-gray-800 text-white">Senior Level</option>
                      <option value="Executive" className="bg-gray-800 text-white">Executive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Job Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    rows={6}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Add Requirement</label>
                    <div className="flex gap-2">
                      <Input
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder="e.g. 5+ years of Python development experience"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50"
                      />
                      <Button type="button" onClick={addRequirement} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {formData.requirements.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Current Requirements</label>
                      <div className="space-y-2">
                        {formData.requirements.map((req, index) => (
                          <div key={index} className="flex items-center justify-between bg-white/5 border border-white/10 p-2 rounded backdrop-blur-md">
                            <span className="text-sm text-gray-300">{req}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRequirement(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Add Skill</label>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g. Python, React, AWS"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50"
                      />
                      <Button type="button" onClick={addSkill} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {formData.skills.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Required Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                            {skill}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 text-red-400 hover:text-red-300"
                              onClick={() => removeSkill(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Salary Range</label>
                    <Input
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      placeholder="e.g. $120,000 - $150,000"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Application Deadline</label>
                    <Input
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Benefits</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="e.g. Health Insurance, Remote Work"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50"
                    />
                    <Button type="button" onClick={addBenefit} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.benefits.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1 border-green-500/30 text-green-300">
                          {benefit}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 text-red-400 hover:text-red-300"
                            onClick={() => removeBenefit(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/search')}
                className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {isLoading ? 'Creating...' : 'Post Job'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default JobPostingPage;
