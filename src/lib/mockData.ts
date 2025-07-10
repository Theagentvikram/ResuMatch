import { User, Resume, SearchResult } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    username: "recruiter",
    password: "password123", // Never do this in real apps!
    role: "recruiter",
  },
  {
    id: "2",
    username: "admin",
    password: "admin123", // Never do this in real apps!
    role: "admin",
  },
  {
    id: "3",
    username: "user",
    password: "password123", // Never do this in real apps!
    role: "applicant",
  }
];

// Mock Resumes
export const mockResumes: Resume[] = [
  {
    id: uuidv4(),
    filename: "john-smith-resume.pdf",
    originalName: "John Smith Resume.pdf",
    uploadDate: new Date(2023, 1, 15).toISOString(),
    summary: "Experienced Python developer with 3 years in data science projects. Proficient in SQL, pandas, and machine learning libraries. Bachelor's in Computer Science from MIT.",
    category: "Data Scientist",
    skills: ["Python", "SQL", "Machine Learning", "pandas", "scikit-learn"],
    experience: 3,
    educationLevel: "Bachelor's",
    fileUrl: "/mock-resume.pdf"
  },
  {
    id: uuidv4(),
    filename: "sarah-jones-resume.pdf",
    originalName: "Sarah Jones Resume.pdf",
    uploadDate: new Date(2023, 2, 20).toISOString(),
    summary: "Full-stack developer with 4 years experience. Expertise in React, Node.js, and Express. Built scalable web applications for fintech startups. Master's in Software Engineering.",
    category: "Software Engineer",
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
    experience: 4,
    educationLevel: "Master's",
    fileUrl: "/mock-resume.pdf"
  },
  {
    id: uuidv4(),
    filename: "michael-williams-resume.pdf",
    originalName: "Michael Williams Resume.pdf",
    uploadDate: new Date(2023, 3, 10).toISOString(),
    summary: "Web developer with 2 years experience in frontend technologies. Skilled in HTML, CSS, JavaScript and React. Created responsive websites for multiple clients. Bachelor's in Web Development.",
    category: "Web Developer",
    skills: ["HTML", "CSS", "JavaScript", "React", "Responsive Design"],
    experience: 2,
    educationLevel: "Bachelor's",
    fileUrl: "/mock-resume.pdf"
  },
  {
    id: uuidv4(),
    filename: "emily-brown-resume.pdf",
    originalName: "Emily Brown Resume.pdf",
    uploadDate: new Date(2023, 4, 5).toISOString(),
    summary: "AI engineer with 5 years experience. Developed computer vision and NLP models. Expert in Python, TensorFlow, and PyTorch. PhD in Machine Learning from Stanford.",
    category: "AI Engineer",
    skills: ["Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision"],
    experience: 5,
    educationLevel: "PhD",
    fileUrl: "/mock-resume.pdf"
  },
  {
    id: uuidv4(),
    filename: "david-lee-resume.pdf",
    originalName: "David Lee Resume.pdf",
    uploadDate: new Date(2023, 5, 12).toISOString(),
    summary: "Data analyst with 1 year experience. Proficient in SQL, Excel, and Power BI. Created data visualizations for business metrics. Bachelor's in Statistics.",
    category: "Data Analyst",
    skills: ["SQL", "Excel", "Power BI", "Data Visualization", "Statistics"],
    experience: 1,
    educationLevel: "Bachelor's",
    fileUrl: "/mock-resume.pdf"
  },
  {
    id: uuidv4(),
    filename: "jessica-taylor-resume.pdf",
    originalName: "Jessica Taylor Resume.pdf",
    uploadDate: new Date(2023, 6, 18).toISOString(),
    summary: "Backend developer with 3 years experience in Python and Django. Designed RESTful APIs and database schemas. Master's in Computer Engineering.",
    category: "Software Engineer",
    skills: ["Python", "Django", "RESTful API", "PostgreSQL", "Docker"],
    experience: 3,
    educationLevel: "Master's",
    fileUrl: "/mock-resume.pdf"
  },
  {
    id: uuidv4(),
    filename: "alex-martinez-resume.pdf",
    originalName: "Alex Martinez Resume.pdf",
    uploadDate: new Date(2023, 7, 25).toISOString(),
    summary: "Frontend developer with 2 years experience. Expertise in JavaScript, Vue.js, and CSS frameworks. Created interactive UIs for e-commerce websites. Bachelor's in Information Systems.",
    category: "Web Developer",
    skills: ["JavaScript", "Vue.js", "CSS", "Tailwind CSS", "Webpack"],
    experience: 2,
    educationLevel: "Bachelor's",
    fileUrl: "/mock-resume.pdf"
  }
];

// Simple mock service to simulate resumé matching
export const searchResumes = (query: string): Promise<SearchResult[]> => {
  // In a real app, this would use an LLM and vector search
  // Here, we just do simple keyword matching
  
  const keywords = query.toLowerCase().split(/\s+/);
  
  const results: SearchResult[] = mockResumes
    .map(resume => {
      const summaryLower = resume.summary.toLowerCase();
      const categoryLower = resume.category.toLowerCase();
      const skillsLower = resume.skills.map(s => s.toLowerCase());
      
      // Count keyword matches in summary, category, and skills
      const summaryMatches = keywords.filter(k => summaryLower.includes(k)).length;
      const categoryMatches = keywords.filter(k => categoryLower.includes(k)).length;
      const skillMatches = keywords.reduce((count, keyword) => {
        return count + skillsLower.filter(skill => skill.includes(keyword)).length;
      }, 0);
      
      // Calculate a simple match score
      const totalMatches = summaryMatches + categoryMatches * 2 + skillMatches * 3;
      
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
        matchReason: matchReason || undefined
      };
    })
    .filter(result => result.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
  
  // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(results.slice(0, 5)); // Return top 5 results
    }, 800);
  });
};

// Login service
export const loginUser = async (username: string, password: string): Promise<User | null> => {
  // Check built-in mock users first
  const mockUser = mockUsers.find(user => user.username === username && user.password === password);
  if (mockUser) {
    return mockUser;
  }
  
  // Check users created through signup
  const signupUsers = JSON.parse(localStorage.getItem("resumatch_users") || "[]");
  const signupUser = signupUsers.find((user: User) => user.username === username && user.password === password);
  if (signupUser) {
    return signupUser;
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return null; // Login failed
};

// Save resume service
export const saveResume = (file: File, summary: string, category: string): Promise<Resume> => {
  const newResume: Resume = {
    id: uuidv4(),
    filename: file.name.replace(/\s+/g, "-").toLowerCase(),
    originalName: file.name,
    uploadDate: new Date().toISOString(),
    summary,
    category,
    skills: [], // Would be extracted by AI in a real app
    experience: 0, // Would be extracted by AI in a real app
    educationLevel: "Unknown", // Would be extracted by AI in a real app
    fileUrl: URL.createObjectURL(file) // In a real app, this would be a URL to the stored file
  };
  
  // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      // In a real app, this would add the resume to a database
      resolve(newResume);
    }, 1000);
  });
};
