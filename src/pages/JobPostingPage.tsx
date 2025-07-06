import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "../hooks/use-toast";
import { API_BASE_URL } from '../config/api';
import { Plus, X } from 'lucide-react';

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

      const result = await response.json();
      
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600">Create a job posting to attract the best candidates</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Senior Python Developer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company *</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. TechCorp Solutions"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Job Type</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.jobType}
                    onChange={(e) => handleInputChange('jobType', e.target.value)}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Add Requirement</label>
                  <div className="flex gap-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="e.g. 5+ years of Python development experience"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <Button type="button" onClick={addRequirement} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.requirements.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Requirements</label>
                    <div className="space-y-2">
                      {formData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{req}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement(index)}
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

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Add Skill</label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g. Python, React, AWS"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.skills.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Required Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
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

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Salary Range</label>
                  <Input
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="e.g. $120,000 - $150,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Application Deadline</label>
                  <Input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Benefits</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="e.g. Health Insurance, Remote Work"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  />
                  <Button type="button" onClick={addBenefit} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {formData.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {benefit}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
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
              onClick={() => navigate('/recruiter')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? 'Creating...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingPage;
