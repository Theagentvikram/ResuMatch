/**
 * API Configuration
 */

// API base URL - update for production
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// API endpoints
export const API_ENDPOINTS = {
  // Resume endpoints
  RESUME: {
    ANALYZE: `${API_BASE_URL}/api/resumes/analyze`,
    UPLOAD: `${API_BASE_URL}/api/resumes/upload`,
    UPLOAD_BULK: `${API_BASE_URL}/api/resumes/upload-bulk`,
    GET_ALL: `${API_BASE_URL}/api/resumes/user`,
    SEARCH: `${API_BASE_URL}/api/resumes/search`,
    DOWNLOAD: (id: string) => `${API_BASE_URL}/api/resumes/download/${id}`,
    GET_SKILLS: `${API_BASE_URL}/api/skills`,
  },
  
  // Model endpoints
  MODEL: {
    STATUS: `${API_BASE_URL}/api/model/status`,
  },
  
  // Auth endpoints (for future use)
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  
  // Job endpoints (for future use)
  JOBS: {
    SEARCH: `${API_BASE_URL}/jobs/search`,
    GET: (id: string) => `${API_BASE_URL}/jobs/${id}`,
    APPLY: `${API_BASE_URL}/jobs/apply`,
  },
};

// Helper function to build API URLs
export const buildUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`;
};

// Download URL helper
export const getDownloadUrl = (id: string): string => {
  return `${API_BASE_URL}/api/resumes/download/${id}`;
};