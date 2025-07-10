export interface User {
  id: string;
  username: string;
  password: string; // Note: In a real app, we'd never store passwords in plain text
  role: 'admin' | 'recruiter' | 'applicant';
}

export interface Resume {
  id: string;
  name?: string;
  filename?: string;
  originalName?: string;
  size?: number;
  uploadDate: string;
  summary: string;
  category: string;
  skills: string[];
  experience: number;
  educationLevel: string;
  downloadUrl?: string;
  fileUrl?: string;
  status?: 'pending' | 'reviewed' | 'rejected';
  matchScore?: number;
}

export interface SearchResult {
  resume: Resume;
  matchScore: number;
  matchReason?: string;
  scoreSource?: string;
  jobDescriptionSkills?: string[];
}
