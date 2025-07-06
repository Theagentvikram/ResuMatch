# ResuMatch - AI-Powered Resume Matching System

An intelligent recruitment platform that uses AI to match job descriptions with candidate resumes, featuring advanced analysis and smart recommendations.

## 🆕 Recent Updates

### 🎉 Job Portal Integration (Latest)
1. **Job Posting System** - HR/Recruiters can create and manage job postings
2. **Smart Resume-Job Matching** - AI-powered matching with detailed compatibility scores
3. **Personalized Suggestions** - Get actionable improvement tips for resumes based on specific jobs
4. **Skills Gap Analysis** - Identify missing skills and get recommendations
5. **Job Portal for Applicants** - Browse available jobs and see which resumes match best

### Enhanced Recruiter Experience
1. **Job Description File Upload** - Upload PDF, Word, or text files to extract required skills and qualifications automatically
2. **Smart Skill Highlighting** - Matched skills are highlighted in green, unmatched skills remain standard
3. **AI-Powered Suggestions** - Get intelligent recommendations for candidates based on skill gaps and matches

## 🚀 Features

### For Recruiters
- **Job Posting & Management** - Create, edit, and manage job listings
- **Smart Job Description Analysis** - Upload JD files or paste text to extract skills, requirements, and experience levels
- **Advanced Resume Search** - Natural language queries with AI-powered matching
- **Resume-Job Matching** - See compatibility scores and skill gaps for each candidate
- **AI Candidate Insights** - Get personalized suggestions for each candidate
- **Resume Management** - View, filter, and download candidate profiles

### For Applicants
- **Job Portal** - Browse available job postings and see compatibility with your resumes
- **Resume Upload & Analysis** - Automated PDF processing with skill extraction
- **Personalized Improvement Tips** - Get AI-powered suggestions to improve your resume for specific jobs
- **Status Tracking** - Monitor application progress
- **Profile Management** - View processed resume data

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** + **Radix UI** for modern design
- **Framer Motion** for animations
- **TanStack Query** for data fetching

### Backend
- **FastAPI** with Python 3.11
- **OpenRouter API** (Mistral 7B) for AI analysis
- **PyMuPDF + pdfplumber** for PDF processing
- **Sentence Transformers** for embeddings
- **SQLite/Supabase** for data storage

## 🐳 Docker Setup

### Development with Docker Compose
```bash
# Clone the repository
git clone <repository-url>
cd resu-test

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up --build

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

### Production Deployment

#### Backend (Render/Railway/similar)
```bash
# Environment Variables Required:
OPENROUTER_API_KEY=your_openrouter_api_key
ANALYZER_MODE=auto
PORT=8000
```

#### Frontend (Vercel/Netlify)
```bash
# Environment Variables:
VITE_API_URL=https://your-backend-url.com
```

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Frontend Setup
```bash
cd /path/to/project
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📝 API Endpoints

### New Job Portal Endpoints

#### Job Management
- `POST /api/jobs` - Create a new job posting
- `GET /api/jobs` - Get all job postings
- `GET /api/jobs/{job_id}` - Get specific job details
- `POST /api/jobs/{job_id}/match-resumes` - Get resume matches for a job
- `POST /api/resumes/{resume_id}/personalized-suggestions` - Get AI suggestions for a resume-job combination

#### Job Description Analysis
- `POST /api/job-description/analyze` - Analyze uploaded JD file
- `POST /api/job-description/analyze-text` - Analyze JD text

#### AI Suggestions
- `POST /api/ai-suggestions` - Get AI recommendations for candidates

### Existing Endpoints
- `POST /api/resumes/upload` - Upload resume files
- `POST /api/resumes/search` - Search resumes with AI or keyword matching
- `GET /api/resumes/user` - Get user's uploaded resumes
- `GET /api/resumes/download/{id}` - Download resume files

## 🎯 Usage Guide

### For Recruiters

1. **Upload Job Description**
   - Navigate to Search page
   - Upload PDF/Word file or paste text
   - System extracts skills and requirements automatically

2. **Search Candidates**
   - Use natural language queries (e.g., "Python developer with 3+ years")
   - Choose between AI Analysis or Resume Matching
   - View ranked results with match scores

3. **Review Candidates**
   - Matched skills appear in green
   - Unmatched skills in standard gray
   - Click "AI Suggestions" for personalized recommendations

4. **Get AI Insights**
   - AI analyzes skill gaps and provides actionable advice
   - Suggestions include what's missing and what matches well

### For Applicants

1. **Upload Resume**
   - Go to Upload page
   - Select PDF resume file
   - System processes and extracts information

2. **Track Status**
   - Monitor processing status
   - View extracted skills and summary

## 🔐 Environment Variables

### Backend (.env)
```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
ANALYZER_MODE=auto
SUPABASE_URL=your_supabase_url (optional)
SUPABASE_KEY=your_supabase_key (optional)
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🚢 Deployment

The application is configured for automatic deployment:

### Backend (Render)
- Push to GitHub triggers automatic deployment
- Uses `backend/Dockerfile` and `backend/render.yaml`
- Environment variables set in Render dashboard

### Frontend (Vercel)
- Connected to GitHub for automatic deployments
- Uses `vercel.json` configuration
- Environment variables set in Vercel dashboard

## 🧪 Testing

### Frontend
```bash
npm run build  # Check for TypeScript errors
npm run dev    # Development server
```

### Backend
```bash
# Run the server
uvicorn main:app --reload

# Test endpoints
curl http://localhost:8000/health
```

## 📄 File Structure
```
├── src/                     # Frontend React application
│   ├── components/          # UI components
│   │   ├── JobDescriptionUpload.tsx  # New JD upload component
│   │   ├── ResumeResults.tsx         # Enhanced results with AI
│   │   └── SearchForm.tsx            # Updated search form
│   ├── pages/              # Route components
│   └── types/              # TypeScript definitions
├── backend/                # FastAPI backend
│   ├── main.py            # Enhanced with new endpoints
│   ├── services/          # Business logic services
│   └── requirements.txt   # Updated dependencies
├── docker-compose.yml     # Development container setup
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs` when server is running

## 🔄 Auto-Deployment

The application is configured for seamless deployment:
- **Frontend**: Vercel automatically deploys on push to main branch
- **Backend**: Render automatically deploys on push to main branch
- All Docker configurations are production-ready

---

Built with ❤️ using modern web technologies and AI capabilities.
