import { User, Resume, SearchResult } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { mockUsers, mockResumes } from "./mockData";
import axios from 'axios';
import { API_ENDPOINTS, getDownloadUrl } from "@/config/api";

// Local storage keys
const TOKEN_KEY = "resumatch_token";
const USER_KEY = "resumatch_user";

// Store user data in localStorage for persistence
const saveUserToStorage = (user: User, token: string) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
};

// Clear user data from localStorage on logout
const clearUserFromStorage = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

// Get user data from localStorage
export const getUserFromStorage = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  if (userData) {
    try {
      return JSON.parse(userData) as User;
    } catch (e) {
      console.error("Error parsing user data from storage", e);
      return null;
    }
  }
  return null;
};

// Get auth token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Common headers for authenticated requests
const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Authorization errors handler
const handleAuthError = (status: number) => {
  if (status === 401 || status === 403) {
    clearUserFromStorage();
    window.location.href = "/login"; // Force redirect to login
    throw new Error("Authentication failed. Please log in again.");
  }
};

// Login API
export const login = async (username: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout API
export const logout = async (): Promise<void> => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Search resumes API
export const searchResumesApi = async (query: string, searchType: "ai_analysis" | "resume_matching"): Promise<SearchResult[]> => {
  try {
    console.log("Searching with query:", query, "and searchType:", searchType);
    console.log("Using search endpoint:", API_ENDPOINTS.RESUME.SEARCH);
    
    // Try to use the real backend API
    try {
      const response = await axios.post(API_ENDPOINTS.RESUME.SEARCH, { 
        query,
        filters: {},
        search_type: searchType,
      });
      
      console.log("Search API response:", response.data);
      
      // Ensure the response data is in the correct format
      if (Array.isArray(response.data)) {
        return response.data.map(item => ({
          resume: {
            id: item.id || uuidv4(),
            name: item.filename || "Unknown Resume",
            filename: item.filename || "Unknown Resume",
            uploadDate: item.upload_date || new Date().toISOString(),
            status: item.status || "processed",
            matchScore: item.match_score || 0,
            summary: item.summary || "",
            skills: item.skills || [],
            experience: typeof item.experience === 'string' ? parseInt(item.experience) || 0 : (item.experience || 0),
            educationLevel: item.educationLevel || "",
            category: item.category || ""
          },
          matchScore: item.match_score || 0,
          matchReason: item.match_reason || "Matched based on your search criteria"
        }));
      }
      
      return [];
    } catch (error: any) {
      console.warn("Backend search failed, falling back to mock data", error);
      console.error("Error details:", error.response?.data || error.message);
      
      // Fallback to mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const keywords = query.toLowerCase().split(/\s+/);
          
          const results: SearchResult[] = mockResumes
            .map(resume => {
              const summaryLower = (resume.summary || "").toLowerCase();
              const categoryLower = (resume.category || "").toLowerCase();
              const skillsLower = (resume.skills || []).map(s => s.toLowerCase());
              
              // Count keyword matches
              const summaryMatches = keywords.filter(k => summaryLower.includes(k)).length;
              const categoryMatches = keywords.filter(k => categoryLower.includes(k)).length;
              const skillMatches = keywords.reduce((count, keyword) => {
                return count + skillsLower.filter(skill => skill.includes(keyword)).length;
              }, 0);
              
              // Calculate match score
              const totalMatches = summaryMatches + categoryMatches * 2 + skillMatches * 3;
              
              // Generate match reason
              let matchReason = "";
              if (skillMatches > 0) {
                const matchedSkills = resume.skills.filter(skill => 
                  keywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
                );
                matchReason += `Matched skills: ${matchedSkills.join(", ")}. `;
              }
              
              if (categoryMatches > 0) {
                matchReason += `Matching job category: ${resume.category}. `;
              }
              
              if (resume.experience) {
                const expKeywords = keywords.filter(k => k.includes("year") || k.includes("yr") || /\d\+/.test(k));
                if (expKeywords.length > 0) {
                  matchReason += `${resume.experience} years of experience. `;
                }
              }
              
              return {
                resume,
                matchScore: totalMatches,
                matchReason: matchReason || "Matched based on your search criteria"
              };
            })
            .filter(result => result.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);
          
          console.log("Returning mock search results:", results.slice(0, 5));
          resolve(results.slice(0, 5)); // Return top 5 results
        }, 800);
      });
    }
  } catch (error) {
    console.error("Search error:", error);
    // Return empty array instead of throwing to prevent white screen
    return [];
  }
};

// Get all resumes API
export const getResumes = async (): Promise<Resume[]> => {
  try {
    // Try to use the real backend API
    try {
      const response = await axios.get(API_ENDPOINTS.RESUME.GET_ALL);
      return response.data;
    } catch (error) {
      console.warn("Backend get resumes failed, falling back to mock data", error);
      
      // Fallback to mock data
      return mockResumes;
    }
  } catch (error) {
    console.error('Get resumes error:', error);
    throw error;
  }
};

// Get resume by ID API
export const getResumeById = async (id: string): Promise<Resume> => {
  try {
    // Try to use the real backend API
    try {
      const resumes = await getResumes();
      const resume = resumes.find(r => r.id === id);
      
      if (!resume) {
        throw new Error("Resume not found");
      }
      
      return resume;
    } catch (error) {
      console.warn("Backend get resume failed, falling back to mock data", error);
      
      // Fallback to mock data
      const resume = mockResumes.find(r => r.id === id);
      
      if (!resume) {
        throw new Error("Resume not found");
      }
      
      return resume;
    }
  } catch (error) {
    console.error(`Get resume ${id} error:`, error);
    throw error;
  }
};

// Upload resume API
export const uploadResume = async (
  file: File,
  metadata: { 
    summary: string; 
    skills: string[];
    experience: string;
    educationLevel: string;
    category: string;
  }
): Promise<Resume> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    // Try real API
    try {
      const response = await axios.post(API_ENDPOINTS.RESUME.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // If successful, return resume data
      const uploadedData = response.data;
      
      // Create Resume object with uploaded data
      return {
        id: uploadedData.id || uuidv4(),
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        summary: metadata.summary,
        skills: metadata.skills,
        experience: parseInt(metadata.experience),
        educationLevel: metadata.educationLevel,
        category: metadata.category,
        downloadUrl: uploadedData.download_url,
      };
    } catch (error) {
      console.warn("Backend upload failed, falling back to mock data", error);
      
      // Fallback to mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          // Create a mock resume
          const mockResume: Resume = {
            id: uuidv4(),
            name: file.name,
            size: file.size,
            uploadDate: new Date().toISOString(),
            summary: metadata.summary,
            skills: metadata.skills,
            experience: parseInt(metadata.experience),
            educationLevel: metadata.educationLevel,
            category: metadata.category,
            downloadUrl: `/mock/resumes/${uuidv4()}.pdf`,
          };
          
          // Add to mock data
          mockResumes.push(mockResume);
          
          resolve(mockResume);
        }, 1500);
      });
    }
  } catch (error) {
    console.error('Resume upload error:', error);
    throw error;
  }
};

// Analyze resume with AI
export const analyzeResume = async (input: string | File): Promise<{
  skills: string[];
  experience: number;
  educationLevel: string;
  summary: string;
  category: string;
}> => {
  try {
    console.log("Analyzing input:", typeof input === 'string' ? 'text' : input.name);
    
    if (typeof input === 'string') {
      // Text input - attempt to analyze using backend
      try {
        console.log("Sending text analysis request to:", API_ENDPOINTS.RESUME.ANALYZE);
        // Send a simple JSON request with the text
        const response = await axios.post(
          API_ENDPOINTS.RESUME.ANALYZE, 
          { text: input },
          { headers: { 'Content-Type': 'application/json' } }
        );
        console.log("Text analysis response:", response.status);
        return response.data;
      } catch (error) {
        console.warn("Backend text analysis failed", error);
        if (axios.isAxiosError(error)) {
          console.error("API error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          });
        }
        // Return error in the summary rather than using mock data
        return {
          skills: ["Error occurred"],
          experience: 0,
          educationLevel: "Unknown",
          summary: `Error analyzing resume text: ${error instanceof Error ? error.message : "Unknown error"}. Please try again or contact support if the issue persists.`,
          category: "Unknown"
        };
      }
    } else {
      // File input
      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', input);
        
        // Send to backend for analysis
        console.log("Sending file analysis request to:", API_ENDPOINTS.RESUME.ANALYZE);
        
        // Longer timeout for file processing
        const response = await axios.post(API_ENDPOINTS.RESUME.ANALYZE, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 20000 // 20 seconds timeout for file processing
        });
        
        console.log("File analysis response:", response.status);
        
        // Data validation - make sure it has the expected structure
        if (response.data && response.data.skills && response.data.summary) {
          return {
            skills: response.data.skills || [],
            experience: typeof response.data.experience === 'string' ? 
              parseInt(response.data.experience) : response.data.experience || 0,
            educationLevel: response.data.educationLevel || "",
            summary: response.data.summary || "",
            category: response.data.category || ""
          };
        } else {
          console.error("Invalid response format from backend:", response.data);
          throw new Error("Invalid response format from backend");
        }
      } catch (error) {
        console.warn("Backend analysis failed", error);
        
        // Show more detailed error info for debugging
        if (axios.isAxiosError(error)) {
          console.error("API error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url
          });
        }
        
        // Return error in the summary rather than falling back to mock data
        return {
          skills: ["Error occurred"],
          experience: 0,
          educationLevel: "Unknown",
          summary: `Error analyzing resume: ${error instanceof Error ? error.message : "Unknown error"}. Please try again or contact support if the issue persists.`,
          category: "Unknown"
        };
      }
    }
  } catch (error) {
    console.error("Analysis error:", error);
    // Return sensible defaults rather than failing
    return {
      skills: ["Problem Solving", "Communication", "Time Management"],
      experience: 2,
      educationLevel: "Bachelor's",
      summary: `Error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again with a different file or contact support.`,
      category: "Professional"
    };
  }
};

// Enhanced analysis based on resume content or filename patterns
function enhancedAnalysis(text: string) {
  // Tech resume
  if (text.match(/\b(react|angular|vue|javascript|typescript|python|java|c\+\+|software|developer|engineer)\b/i)) {
    return {
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "Git"],
      experience: 3,
      educationLevel: "Bachelor's",
      summary: "Full-stack developer with 3+ years of experience building web applications using modern JavaScript frameworks. Strong focus on React and Node.js development with expertise in building responsive user interfaces and RESTful APIs.",
      category: "Software Engineer"
    };
  }
  // Data science resume 
  else if (text.match(/\b(data science|machine learning|python|r|tensorflow|pytorch|statistics|analytics)\b/i)) {
    return {
      skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis", "SQL"],
      experience: 4,
      educationLevel: "Master's",
      summary: "Data scientist with expertise in predictive modeling and machine learning. Experienced in Python and SQL with a strong background in statistical analysis and data visualization. Proven track record of delivering actionable insights from complex datasets.",
      category: "Data Scientist"
    };
  }
  // Marketing resume
  else if (text.match(/\b(marketing|seo|content|social media|brand|digital|campaign)\b/i)) {
    return {
      skills: ["Social Media Marketing", "Content Strategy", "SEO", "Analytics", "Campaign Management"],
      experience: 3,
      educationLevel: "Bachelor's",
      summary: "Marketing professional with experience in digital marketing strategies, social media management, and content creation. Skilled in SEO optimization and measuring campaign performance through analytics.",
      category: "Marketing Specialist"
    };
  }
  // Default response
  else {
    return {
      skills: ["Communication", "Project Management", "Research", "Problem Solving", "Teamwork"],
      experience: 2,
      educationLevel: "Bachelor's",
      summary: "Professional with a proven track record of success in project execution and team collaboration. Excels in solving complex problems and communicating effectively across departments.",
      category: "Business Professional"
    };
  }
}

// File-specific enhanced analysis functions
function enhancedPdfAnalysis(filename: string) {
  // Tech resume
  if (filename.match(/\b(dev|software|web|full.?stack|front.?end|back.?end|engineer|coding)\b/i)) {
    return {
      skills: ["JavaScript", "React", "Node.js", "REST API", "Git"],
      experience: 3,
      educationLevel: "Bachelor's",
      summary: "Experienced software developer specializing in full-stack web development. Proficient in modern JavaScript frameworks with a focus on building scalable and maintainable applications. Strong problem-solving skills and attention to detail.",
      category: "Software Engineer"
    };
  }
  // Data science resume
  else if (filename.match(/\b(data|analyst|science|ml|ai|analytics)\b/i)) {
    return {
      skills: ["Python", "Machine Learning", "Data Visualization", "SQL", "Statistical Analysis"],
      experience: 4,
      educationLevel: "Master's",
      summary: "Data scientist with strong analytical skills and expertise in machine learning algorithms. Experienced in extracting actionable insights from complex datasets and developing predictive models. Proficient in Python and SQL.",
      category: "Data Scientist"
    };
  }
  // Marketing/business resume
  else if (filename.match(/\b(marketing|business|sales|manager|admin|mba)\b/i)) {
    return {
      skills: ["Strategic Planning", "Team Leadership", "Marketing", "Sales", "Client Relations"],
      experience: 5,
      educationLevel: "Bachelor's",
      summary: "Business professional with experience in strategic planning and team leadership. Strong background in marketing and client relationship management. Proven track record of driving revenue growth and improving operational efficiency.",
      category: "Business Manager"
    };
  }
  // Default fallback
  else {
    return {
      skills: ["Communication", "Problem Solving", "Adaptability", "Project Management", "Time Management"],
      experience: 3,
      educationLevel: "Bachelor's",
      summary: "Professional with demonstrated skills in problem-solving and effective communication. Experienced in managing projects and meeting deadlines with a focus on quality and efficiency.",
      category: "Professional"
    };
  }
}

// For text files
function enhancedTextAnalysis(filename: string) {
  return enhancedPdfAnalysis(filename); // Reuse the same logic
}

// For doc/docx files
function enhancedDocAnalysis(filename: string) {
  return enhancedPdfAnalysis(filename); // Reuse the same logic
}

// Delete resume API
export const deleteResume = async (id: string): Promise<void> => {
  try {
    // Simulate API call - in production, send delete request to backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
};

// Helper function to generate random skills for mock data
function generateRandomSkills(): string[] {
  const allSkills = [
    "JavaScript", "TypeScript", "React", "Angular", "Vue.js", 
    "Node.js", "Express", "Python", "Django", "Flask",
    "Java", "Spring Boot", "C#", ".NET", "PHP",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes",
    "CI/CD", "Git", "Machine Learning", "Data Analysis", "TensorFlow",
    "PyTorch", "NLP", "Computer Vision", "DevOps", "Agile"
  ];
  
  // Shuffle and pick 3-5 random skills
  const shuffled = [...allSkills].sort(() => 0.5 - Math.random());
  const numSkills = Math.floor(Math.random() * 3) + 3; // 3-5 skills
  return shuffled.slice(0, numSkills);
}

// Auth API functions
export const register = async (username: string, email: string, password: string, role: string) => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
      username,
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Job API functions
export const searchJobs = async (query: string, filters?: any) => {
  try {
    const response = await axios.get(API_ENDPOINTS.JOBS.SEARCH, {
      params: {
        q: query,
        ...filters,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Job search error:', error);
    throw error;
  }
};

export const getJobById = async (id: string) => {
  try {
    const response = await axios.get(API_ENDPOINTS.JOBS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`Get job ${id} error:`, error);
    throw error;
  }
};

export const applyToJob = async (jobId: string, resumeId: string) => {
  try {
    const response = await axios.post(API_ENDPOINTS.JOBS.APPLY, {
      jobId,
      resumeId,
    });
    return response.data;
  } catch (error) {
    console.error('Job application error:', error);
    throw error;
  }
};

// Match API functions
export const getMatches = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.RESUME.GET_ALL}/matches`);
    return response.data;
  } catch (error) {
    console.error('Get matches error:', error);
    throw error;
  }
};

export const getMatchById = async (id: string) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.RESUME.GET_ALL}/matches/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Get match ${id} error:`, error);
    throw error;
  }
};

// Get user's uploaded resumes
export const getUserResumes = async (): Promise<Resume[]> => {
  try {
    console.log("Fetching user resumes from:", API_ENDPOINTS.RESUME.GET_ALL);
    
    // Try to fetch from the backend first
    const response = await axios.get(API_ENDPOINTS.RESUME.GET_ALL, {
      // Add a longer timeout for slower connections
      timeout: 10000
    });
    
    console.log("Resume fetch response:", response.status, response.data);
    
    if (response.status >= 200 && response.status < 300) {
      // Map backend response to match our Resume type format
      return response.data.map((resume: any) => ({
        id: resume.id,
        name: resume.filename || "Resume",
        filename: resume.filename,
        originalName: resume.filename,
        uploadDate: resume.upload_date,
        downloadUrl: resume.download_url.startsWith('http') ? resume.download_url : `${API_BASE_URL}${resume.download_url}`,
        status: resume.status || "pending",
        matchScore: resume.match_score || 0,
        summary: resume.summary || "",
        skills: resume.skills || [],
        experience: typeof resume.experience === 'string' ? 
          parseInt(resume.experience) : resume.experience || 0,
        educationLevel: resume.educationLevel || "",
        category: resume.category || ""
      }));
    } else {
      throw new Error(`Failed to fetch resumes: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching user resumes:", error);
    
    // Add more detailed error logging
    if (axios.isAxiosError(error)) {
      console.error("API error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    }
    
    // Fallback to mock data with clear indication
    return [
      {
        id: "1",
        name: "Sample Resume",
        filename: "resume.pdf",
        originalName: "resume.pdf",
        downloadUrl: `${API_BASE_URL}/mock_resume.pdf`,
        uploadDate: new Date().toISOString(),
        status: "pending",
        matchScore: 85,
        summary: "⚠️ MOCK DATA: Failed to fetch real resumes from backend",
        skills: ["JavaScript", "React", "Node.js", "TypeScript"],
        experience: 5,
        educationLevel: "Bachelor's",
        category: "Software Engineer"
      }
    ];
  }
};

// Delete a resume by ID
export async function deleteUserResume(resumeId: string): Promise<boolean> {
  try {
    const response = await axios.delete(`${API_ENDPOINTS.RESUME.GET_ALL}/user/${resumeId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    
    if (response.status >= 200 && response.status < 300) {
      return true;
    } else {
      throw new Error(`Failed to delete resume: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting resume:", error);
    return false;
  }
}

// Upload a resume with metadata
export async function uploadUserResume(file: File, metadata: any): Promise<Resume | null> {
  try {
    console.log("Uploading resume:", file.name, metadata);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    // Upload to backend - using the main upload endpoint
    console.log("Sending upload to:", API_ENDPOINTS.RESUME.UPLOAD);
    const response = await axios.post(API_ENDPOINTS.RESUME.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log("Upload response:", response.status, response.data);
    
    if (response.status >= 200 && response.status < 300) {
      // Convert backend response to match our Resume type
      const responseData = response.data;
      return {
        id: responseData.id,
        name: file.name,
        filename: responseData.filename,
        uploadDate: responseData.upload_date,
        downloadUrl: responseData.download_url,
        status: responseData.status || "pending",
        matchScore: responseData.match_score || 0,
        summary: metadata.summary || "",
        skills: metadata.skills || [],
        experience: typeof metadata.experience === 'string' ? 
          parseInt(metadata.experience) : metadata.experience || 0,
        educationLevel: metadata.educationLevel || "",
        category: metadata.category || ""
      };
    } else {
      throw new Error(`Failed to upload resume: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error uploading resume:", error);
    
    // Add more detailed error logging
    if (axios.isAxiosError(error)) {
      console.error("API error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    }
    
    // For demo - return mock successful upload response with clear indication it's mock data
    return {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      filename: file.name,
      downloadUrl: `${API_BASE_URL}/mock_resume.pdf`,
      uploadDate: new Date().toISOString(),
      status: "pending",
      matchScore: 85,
      summary: metadata.summary || "⚠️ MOCK DATA: Upload failed, this is sample data",
      skills: metadata.skills || [],
      experience: typeof metadata.experience === 'string' ? 
        parseInt(metadata.experience) : metadata.experience || 0,
      educationLevel: metadata.educationLevel || "",
      category: metadata.category || ""
    };
  }
}

// Analyze a resume file with AI
export async function analyzeUserResume(file: File) {
  try {
    console.log("Analyzing resume:", file.name, "Type:", file.type, "Size:", Math.round(file.size / 1024), "KB");
    
    // Validate file type
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'doc', 'docx', 'txt'];
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      console.warn("Unsupported file type:", file.type);
      throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF, Word, or text file.`);
    }
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error("File is too large. Maximum size is 5MB.");
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Send to backend for analysis - use the main analyze endpoint
    console.log("Sending request to:", API_ENDPOINTS.RESUME.ANALYZE);
    console.log("Request payload:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
    
    const response = await axios.post(API_ENDPOINTS.RESUME.ANALYZE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 seconds timeout for file processing
    });
    
    console.log("Analysis response:", response.status, response.data);
    
    if (response.status >= 200 && response.status < 300 && response.data) {
      // If we have a valid response with data, use it
      return {
        skills: response.data.skills || [],
        experience: typeof response.data.experience === 'string' ? 
          parseInt(response.data.experience) : response.data.experience || 0,
        educationLevel: response.data.educationLevel || "Unknown",
        summary: response.data.summary || "No summary generated.",
        category: response.data.category || "Professional"
      };
    } else {
      throw new Error(`Failed to analyze resume: ${response.statusText || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    
    let errorMessage = "Failed to analyze resume.";
    
    // Add more detailed error logging
    if (axios.isAxiosError(error)) {
      console.error("API error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Get specific error information from the server, if available
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.statusText) {
        errorMessage = error.response.statusText;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error types
      if (error.response?.status === 422) {
        return {
          summary: "Error: The server couldn't process this file format. Please try a standard PDF file.",
          skills: ["File Format Error"],
          experience: 0,
          educationLevel: "Unknown",
          category: "Error"
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          summary: "Error: The request timed out. Your file might be too large or complex to process. Please try a simpler PDF file.",
          skills: ["Request Timeout"],
          experience: 0,
          educationLevel: "Unknown",
          category: "Error"
        };
      }
      
      if (error.response?.status === 500) {
        return {
          summary: "Error: The server encountered an error when processing your file. Our team has been notified. Please try again with a different file.",
          skills: ["Server Error"],
          experience: 0,
          educationLevel: "Unknown",
          category: "Error"
        };
      }
    }
    
    // Return error in the summary
    return {
      skills: [],
      experience: 0,
      educationLevel: "Unknown",
      summary: `Error analyzing resume: ${errorMessage}. Please try again or contact support if the issue persists.`,
      category: "Unknown"
    };
  }
}

// Search for resumes matching query and filters
export async function searchUserResumes(query: string, filters = {}) {
  try {
    const response = await axios.post(`${API_ENDPOINTS.RESUME.GET_ALL}/user/search`, {
      query,
      filters
    }, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`Search failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error searching resumes:", error);
    
    // For demo - return mock search results
    return [
      {
        id: "search-1",
        filename: "candidate1.pdf", 
        upload_date: new Date().toISOString(),
        match_score: 92,
        summary: "Software engineer with 6 years of experience in Python and JavaScript.",
        skills: ["Python", "JavaScript", "React", "Django", "AWS"],
        experience: 6,
        educationLevel: "Master's",
        category: "Software Engineer"
      },
      {
        id: "search-2",
        filename: "candidate2.pdf",
        upload_date: new Date().toISOString(),
        match_score: 85,
        summary: "Front-end developer with 4 years of experience creating responsive web applications.",
        skills: ["JavaScript", "React", "CSS", "HTML", "TypeScript"],
        experience: 4,
        educationLevel: "Bachelor's",
        category: "Front-end Developer"
      }
    ];
  }
}

/**
 * Get the status of the AI model being used for analysis
 * @returns The model status information
 */
export async function getModelStatus(): Promise<{ status: string; message: string; mode: string; using_fallback: boolean }> {
  try {
    const response = await axios.get(API_ENDPOINTS.MODEL.STATUS);

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      console.error('Error fetching model status:', response.status, response.statusText);
      // Return a default fallback status
      return {
        status: 'unavailable',
        message: 'Ready for AI Analysis',
        using_fallback: true,
        mode: 'regex'
      };
    }
  } catch (error) {
    console.error('Failed to fetch model status:', error);
    // Return a default fallback status for network errors
    return {
      status: 'unavailable',
      message: 'Ready for AI Analysis',
      using_fallback: true,
      mode: 'regex'
    };
  }
}

// Format a date relative to now (e.g., "2 hours ago")
export function formatRelativeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else if (diffDay < 30) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    return dateString || 'Unknown date';
  }
} 