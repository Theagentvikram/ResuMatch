import os
from typing import List, Optional, Dict, Any, Literal
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
from datetime import datetime
import json
import uuid
import requests
from dotenv import load_dotenv
from pathlib import Path
import tempfile
import shutil
import random
import re

# Import services
try:
    from services.pdf_service import extract_text_from_pdf, extract_with_pdfplumber
except ImportError:
    # Create a fallback if PyMuPDF is not installed
    def extract_text_from_pdf(file_path):
        return "This is mock text extracted from a PDF. PyMuPDF (fitz) is not installed."
    def extract_with_pdfplumber(file_path):
        return "This is mock text extracted from a PDF. pdfplumber is not installed."

from services.llm_service import get_resume_summary
from services.embedding_service import get_embedding, calculate_similarity
from services.storage_service import upload_to_storage, get_download_url, LOCAL_STORAGE_DIR
from services.database_service import save_resume_to_db, get_resumes, search_resumes
from services.regex_service import analyze_resume_with_regex
from services.openrouter_service import get_relevance_score_with_openrouter

# Import OpenRouter service for Mistral 7B
try:
    from services.openrouter_service import analyze_resume_with_openrouter, get_openrouter_model_status
    OPENROUTER_API_AVAILABLE = True
except ImportError:
    OPENROUTER_API_AVAILABLE = False
    # Create fallback functions
    def analyze_resume_with_openrouter(text):
        return analyze_resume_with_regex(text)
    def get_openrouter_model_status():
        return {"status": "unavailable", "message": "OpenRouter service not installed", "using_fallback": True}

# Offline Mistral is not available (file deleted)
OFFLINE_MISTRAL_AVAILABLE = False
def analyze_resume_with_mistral_offline(text):
    return analyze_resume_with_regex(text)
def is_mistral_model_available():
    return False
def preload_model():
    pass

# Local LLM service is not available (file deleted)
LLAMA_CPP_AVAILABLE = False
def analyze_resume_with_llama_cpp(text):
    return analyze_resume_with_regex(text)
def is_llama_cpp_available():
    return False
def download_model(url=None):
    return None

# Load environment variables
load_dotenv()

# Get the desired analyzer mode from environment
ANALYZER_MODE = os.getenv("ANALYZER_MODE", "auto").lower()  # "auto", "api", "offline", "regex", "llama_cpp"

app = FastAPI(title="ResuMatch API", description="API for ResuMatch Resume Selection App")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://resume-ai-pink-eight.vercel.app",
        "https://resumatch.vercel.app",  # Production frontend
        "https://resumatcher.netlify.app",  # Netlify frontend
        "http://localhost:5173",  # For local development
        "http://localhost:8000",  # For local development
        "http://localhost:3000",  # For local development with different port
        "*",  # Allow all origins temporarily for debugging
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create storage directory if it doesn't exist
os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)

# Resume storage file path
RESUMES_FILE = Path("./storage/resumes.json")

# Initialize resumes from file if it exists
def load_resumes():
    if RESUMES_FILE.exists():
        try:
            with open(RESUMES_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading resumes: {str(e)}")
    return []

def save_resumes(resumes):
    try:
        with open(RESUMES_FILE, 'w') as f:
            json.dump(resumes, f, indent=2)
    except Exception as e:
        print(f"Error saving resumes: {str(e)}")

# Load existing resumes
USER_RESUMES = load_resumes()

class ResumeAnalysisResponse(BaseModel):
    skills: List[str]
    experience: int
    educationLevel: str
    summary: str
    category: str

class ResumeUploadRequest(BaseModel):
    skills: List[str]
    experience: str
    educationLevel: str
    summary: str
    category: str

class SearchQuery(BaseModel):
    query: str
    filters: Optional[dict] = None
    search_type: Literal["ai_analysis", "resume_matching"] = "ai_analysis"

class AnalysisResult(BaseModel):
    summary: str
    skills: List[str]
    experience: int
    educationLevel: str
    category: str

class TextAnalysisRequest(BaseModel):
    text: str

class ModelStatusResponse(BaseModel):
    status: str
    message: str
    using_fallback: bool
    mode: Optional[str] = "unknown"

# Job Description Analysis Models
class JobDescriptionAnalysis(BaseModel):
    id: str
    filename: str
    summary: str
    skills: List[str]
    requirements: List[str]
    experience: str
    category: str

class AISuggestionsRequest(BaseModel):
    resumeSkills: List[str]
    jobDescriptionSkills: List[str]
    resumeSummary: str

@app.get("/")
async def root():
    """
    Root endpoint for health check
    """
    return {"status": "ok", "message": "ResuMatch API is running"}

@app.get("/health")
async def health_check():
    """
    Health check endpoint for Render
    """
    return {"status": "healthy", "message": "ResuMatch API is healthy"}

@app.get("/api/model/status", response_model=ModelStatusResponse)
async def model_status():
    """
    Check the status of the LLM model (OpenRouter or regex fallback)
    """
    try:
        # Check if we're in a specific mode
        if ANALYZER_MODE == "api" and OPENROUTER_API_AVAILABLE:
            # Check OpenRouter API
            status = get_openrouter_model_status(fallback_to_mock=True)
            
            # Ensure all required fields are present
            if "using_fallback" not in status:
                status["using_fallback"] = False
            if "mode" not in status:
                status["mode"] = "api"
                
            return status
        
        # Using regex mode
        elif ANALYZER_MODE == "regex":
            return {
                "status": "available",
                "message": "Using regex-based analysis (no LLM)",
                "using_fallback": False,
                "mode": "regex"
            }
        
        # Auto mode - try OpenRouter API first, then fall back to regex
        elif ANALYZER_MODE == "auto":
            # Try OpenRouter API
            if OPENROUTER_API_AVAILABLE:
                status = get_openrouter_model_status(fallback_to_mock=True)
                
                # Ensure all required fields are present
                if "using_fallback" not in status:
                    status["using_fallback"] = False
                if "mode" not in status:
                    status["mode"] = "api"
                    
                if status["status"] == "available":
                    return status
            
            # Fallback to regex
            return {
                "status": "available",
                "message": "Using regex-based analysis (no LLM)",
                "using_fallback": True,
                "mode": "regex"
            }
        
        # Fallback for all other cases
        return {
            "status": "unavailable",
            "message": "No suitable AI model available",
            "using_fallback": True,
            "mode": "regex"
        }
    
    except Exception as e:
        print(f"Error in model status check: {str(e)}")
        return {
            "status": "error",
            "message": f"Error checking model status: {str(e)}",
            "using_fallback": True,
            "mode": "fallback"
        }

@app.post("/api/resumes/analyze", response_model=AnalysisResult)
async def analyze_resume(file: Optional[UploadFile] = File(None), text: Optional[Any] = Body(None)):
    """
    Analyze a resume file or text and extract key information
    """
    try:
        # Increase timeout for large files or complex analysis
        # This runs in a background worker to avoid blocking the server
        background_task = BackgroundTasks()
        
        resume_text = ""
        
        # Handle direct text input
        if text:
            if isinstance(text, dict) and "text" in text:
                resume_text = text["text"]
            else:
                resume_text = str(text)
        
        # Handle file upload
        elif file:
            # Save the uploaded file temporarily
            temp_file = tempfile.NamedTemporaryFile(delete=False)
            try:
                contents = await file.read()
                with open(temp_file.name, "wb") as f:
                    f.write(contents)
                
                # Extract text from PDF
                if file.filename.lower().endswith(".pdf"):
                    resume_text = extract_text_from_pdf(temp_file.name)
                    
                    # If primary extraction fails, try fallback
                    if not resume_text or len(resume_text.strip()) < 100:
                        print("Primary PDF extraction failed. Trying pdfplumber fallback.")
                        resume_text = extract_with_pdfplumber(temp_file.name)
                
                # Handle text files
                elif file.filename.lower().endswith(".txt"):
                    with open(temp_file.name, "r") as f:
                        resume_text = f.read()
                
                else:
                    return JSONResponse(
                        status_code=400,
                        content={"detail": "Unsupported file format. Please upload a PDF or text file."}
                    )
            finally:
                # Clean up the temp file
                os.unlink(temp_file.name)
        
        else:
            return JSONResponse(
                status_code=400,
                content={"detail": "No file or text provided"}
            )
        
        # Check if we have enough text to analyze
        if not resume_text or len(resume_text.strip()) < 50:
            return JSONResponse(
                status_code=400,
                content={"detail": "Not enough text content to analyze"}
            )
        
        # Analyze the resume text
        print(f"Analyzing resume text ({len(resume_text)} chars)")
        
        # Use the appropriate analyzer based on mode
        if ANALYZER_MODE == "api" and OPENROUTER_API_AVAILABLE:
            try:
                # Try OpenRouter API
                print("Using OpenRouter API for analysis")
                result = await analyze_resume_with_openrouter(resume_text)
                return result
            except Exception as e:
                print(f"OpenRouter API analysis failed: {str(e)}. Falling back to regex.")
                result = analyze_resume_with_regex(resume_text)
                return result
        else:
            # Fallback to regex-based analysis
            print("Using regex-based analysis")
            result = analyze_resume_with_regex(resume_text)
            return result
        
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Resume analysis failed: {str(e)}"}
        )

@app.post("/api/resumes/upload")
async def upload_resume(file: UploadFile = File(...), metadata: str = Form(...)):
    """
    Upload a resume file with metadata
    """
    try:
        # Parse metadata
        meta_dict = json.loads(metadata)
        
        # Generate a unique ID for the resume
        resume_id = str(uuid.uuid4())
        
        # Get the current timestamp
        timestamp = datetime.now().isoformat()
        
        # Create storage directory if it doesn't exist
        storage_dir = Path("./storage/resumes")
        storage_dir.mkdir(parents=True, exist_ok=True)
        
        # Save the file to disk
        file_path = storage_dir / f"{resume_id}_{file.filename}"
        
        # Read the uploaded file
        contents = await file.read()
        
        # Write to disk
        with open(file_path, "wb") as f:
            f.write(contents)
        
        print(f"Saved resume file to {file_path}")
        
        # Create a resume object
        resume = {
            "id": resume_id,
            "filename": file.filename,
            "download_url": f"/api/resumes/download/{resume_id}",
            "upload_date": timestamp,
            "status": "processed",
            "match_score": random.randint(65, 95),
            "summary": meta_dict.get("summary", ""),
            "skills": meta_dict.get("skills", []),
            "experience": meta_dict.get("experience", ""),
            "educationLevel": meta_dict.get("educationLevel", ""),
            "category": meta_dict.get("category", ""),
            "file_path": str(file_path)
        }
        
        # Add to our storage and save to file
        USER_RESUMES.append(resume)
        save_resumes(USER_RESUMES)
        
        # Print the current resumes for debugging
        print(f"Current resumes in storage: {len(USER_RESUMES)}")
        for r in USER_RESUMES:
            print(f"  - {r['id']}: {r['filename']}")
        
        return resume
    except Exception as e:
        print(f"Error in upload_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/api/resumes/user")
async def get_user_resumes():
    """
    Get resumes for the current user
    """
    try:
        # Reload resumes from file to ensure we have the latest data
        global USER_RESUMES
        USER_RESUMES = load_resumes()
        
        # Print the current resumes for debugging
        print(f"Returning {len(USER_RESUMES)} resumes from storage")
        for r in USER_RESUMES:
            print(f"  - {r['id']}: {r['filename']}")
            
        # If we have no resumes, create some mock data
        if not USER_RESUMES:
            # Add some mock resumes for demonstration
            now = datetime.now().isoformat()
            mock_resumes = [
                {
                    "id": str(uuid.uuid4()),
                    "filename": "resume1.pdf",
                    "download_url": "/mock/resume1.pdf",
                    "upload_date": now,
                    "status": "processed",
                    "match_score": 88,
                    "summary": "Experienced software engineer with 5 years in web development.",
                    "skills": ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB"],
                    "experience": "5",
                    "educationLevel": "Bachelor's",
                    "category": "Software Engineer"
                },
                {
                    "id": str(uuid.uuid4()),
                    "filename": "resume2.pdf",
                    "download_url": "/mock/resume2.pdf",
                    "upload_date": now,
                    "status": "pending",
                    "match_score": 0,
                    "summary": "",
                    "skills": [],
                    "experience": "",
                    "educationLevel": "",
                    "category": ""
                }
            ]
            USER_RESUMES.extend(mock_resumes)
            save_resumes(USER_RESUMES)
            
        return USER_RESUMES
    except Exception as e:
        print(f"Error in get_user_resumes: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to get resumes: {str(e)}"}
        )

def calculate_keyword_match_score(job_query: str, resume: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates a match score for a resume based on a job query using keyword matching,
    with weighted scores for summary, skills, experience, and education.
    """
    score = 0
    match_reasons = []

    # 1. Summary Match (Weight 0.4)
    summary_keywords = [word.lower() for word in re.findall(r'\b\w+\b', job_query) if len(word) > 2]
    summary_hits = 0
    if resume.get("summary"):
        resume_summary_lower = resume["summary"].lower()
        for keyword in summary_keywords:
            if keyword in resume_summary_lower:
                summary_hits += 1
        summary_score = min(summary_hits * 10, 100) # Cap at 100 for summary
        score += summary_score * 0.4
        if summary_score > 0:
            match_reasons.append(f"Summary relevance: {summary_hits} keyword(s) matched.")

    # 2. Skills Match (Weight 0.3)
    query_skills = [skill.strip().lower() for skill in job_query.split(" ") if skill.strip()]
    matched_skills_list = []
    if resume.get("skills"):
        for r_skill in resume["skills"]:
            if any(q_skill in r_skill.lower() for q_skill in query_skills):
                matched_skills_list.append(r_skill)
        
        skill_match_count = len(matched_skills_list)
        # Linear scaling for skills, each skill contributes 20 points up to a max of 100 
        skill_score = min(skill_match_count * 20, 100) 
        score += skill_score * 0.3
        if skill_match_count > 0:
            match_reasons.append(f"Skills match: {skill_match_count} relevant skill(s) found: {', '.join(matched_skills_list)}.")

    # 3. Experience Match (Weight 0.2)
    resume_experience_str = str(resume.get("experience", "0")).replace("+", "").strip()
    resume_experience = 0
    try:
        resume_experience = int(float(resume_experience_str))
    except ValueError:
        pass # Default to 0 if not a valid number

    # Extract experience years from query using regex (e.g., "2+ years", "3 years experience")
    experience_match = re.search(r'(\d+)\s*\+?\s*year(?:s)?(?: experience)?', job_query, re.IGNORECASE)
    required_experience = 0
    if experience_match:
        required_experience = int(experience_match.group(1))

    if resume_experience >= required_experience:
        experience_score = 100 # Full score if meets or exceeds required experience
        match_reasons.append(f"Experience: Matches required {required_experience}+ years.")
    elif resume_experience > 0 and required_experience > 0:
        experience_score = (resume_experience / required_experience) * 100 # Partial score
        match_reasons.append(f"Experience: {resume_experience} years, {required_experience} years required.")
    else:
        experience_score = 0
    score += experience_score * 0.2

    # 4. Education Level Match (Weight 0.1)
    query_education_lower = job_query.lower()
    resume_education_lower = str(resume.get("educationLevel", "")).lower()
    education_score = 0

    if "master" in query_education_lower and "master" in resume_education_lower:
        education_score = 100
    elif "bachelor" in query_education_lower and "bachelor" in resume_education_lower:
        education_score = 100
    elif "phd" in query_education_lower and "phd" in resume_education_lower:
        education_score = 100
    elif not "master" in query_education_lower and not "bachelor" in query_education_lower and not "phd" in query_education_lower:
        # If no specific education level is requested, consider any education a partial match
        if resume_education_lower:
            education_score = 50
    
    if education_score > 0:
        match_reasons.append(f"Education: {resume.get('educationLevel', 'N/A')} matches query.")
    score += education_score * 0.1

    final_score = min(100, max(0, int(score))) # Ensure score is between 0 and 100
    
    return {
        "score": final_score,
        "reason": "; ".join(match_reasons) if match_reasons else "No specific match reasons found for keyword search.",
        "source": "keyword_matching"
    }

@app.post("/api/resumes/search")
async def search_resume(search_query: SearchQuery):
    """
    Search for resumes based on query and filters
    """
    try:
        print(f"Received search query: {search_query.query}, search_type: {search_query.search_type}")
        
        # If no results or no user resumes, return mock data
        mock_results_data = [
            {
                "id": str(uuid.uuid4()),
                "filename": "candidate1.pdf",
                "upload_date": datetime.now().isoformat(),
                "match_score": 92,
                "match_reason": "Strong match on Python, JavaScript skills and experience level (Mock Data)",
                "summary": "Software engineer with 6 years of experience in Python and JavaScript.",
                "skills": ["Python", "JavaScript", "React", "Django", "AWS"],
                "experience": "6",
                "educationLevel": "Master's",
                "category": "Software Engineer"
            },
            {
                "id": str(uuid.uuid4()),
                "filename": "candidate2.pdf",
                "upload_date": datetime.now().isoformat(),
                "match_score": 85,
                "match_reason": "Good match on frontend skills and web development experience (Mock Data)",
                "summary": "Front-end developer with 4 years of experience creating responsive web applications.",
                "skills": ["JavaScript", "React", "CSS", "HTML", "TypeScript"],
                "experience": "4",
                "educationLevel": "Bachelor's",
                "category": "Front-end Developer"
            },
            {
                "id": str(uuid.uuid4()),
                "filename": "candidate3.pdf",
                "upload_date": datetime.now().isoformat(),
                "match_score": 78,
                "match_reason": "Matches on full-stack development and cloud experience (Mock Data)",
                "summary": "Full-stack developer with expertise in MERN stack and cloud services.",
                "skills": ["MongoDB", "Express", "React", "Node.js", "AWS"],
                "experience": "3",
                "educationLevel": "Bachelor's",
                "category": "Full-stack Developer"
            }
        ]
        
        if USER_RESUMES and len(USER_RESUMES) > 0:
            print(f"Searching through {len(USER_RESUMES)} user resumes")
            
            results = []
            for resume in USER_RESUMES:
                resume_content = ""
                score_result = {"score": 0, "reason": "", "source": ""}

                if search_query.search_type == "ai_analysis":
                    # LLM-based analysis
                    if resume.get("file_path"):
                        try:
                            file_extension = Path(resume["file_path"]).suffix.lower()
                            if file_extension == ".pdf":
                                resume_content = extract_text_from_pdf(resume["file_path"])
                                if not resume_content or len(resume_content.strip()) < 100:
                                    print(f"Warning: Primary PDF extraction failed for {resume.get('filename', 'N/A')}. Trying pdfplumber fallback.")
                                    resume_content = extract_with_pdfplumber(resume["file_path"])
                            elif file_extension == ".txt":
                                with open(resume["file_path"], "r") as f:
                                    resume_content = f.read()
                            else:
                                print(f"Warning: Unsupported file format for {resume.get('filename', 'N/A')}. Skipping LLM scoring.")
                                score_result = {"score": 0, "reason": "Unsupported file format for LLM analysis.", "source": "unsupported_format_fallback"}

                            if resume_content and len(resume_content.strip()) >= 50: # Minimum content length to attempt LLM scoring
                                print(f"Getting LLM relevance score for {resume.get('filename', 'N/A')} with query: {search_query.query[:50]}...")
                                score_result = await get_relevance_score_with_openrouter(
                                    job_query=search_query.query,
                                    resume_text=resume_content
                                )
                                score_result["source"] = score_result.get("source", "openrouter_llm")
                            else:
                                print(f"Warning: Not enough content extracted from {resume.get('filename', 'N/A')}. Using mock score.")
                                score_result = {"score": random.randint(30, 60), "reason": "Insufficient resume content for LLM analysis.", "source": "mock_content_fallback"}

                        except Exception as e:
                            print(f"Error processing resume {resume.get('filename', 'N/A')}: {str(e)}. Using mock score.")
                            score_result = {"score": random.randint(30, 60), "reason": f"Error during LLM analysis: {str(e)}", "source": "llm_error_fallback"}
                    else:
                        print(f"No file_path for {resume.get('filename', 'N/A')}. Using mock score.")
                        score_result = {"score": random.randint(20, 50), "reason": "Resume file path missing.", "source": "no_file_path_fallback"}
                
                elif search_query.search_type == "resume_matching":
                    # Non-LLM based resume matching
                    score_result = calculate_keyword_match_score(search_query.query, resume)
                    score_result["source"] = "keyword_matching"

                result = resume.copy()
                result["match_score"] = score_result["score"]
                result["match_reason"] = score_result["reason"]
                result["score_source"] = score_result["source"]
                results.append(result)
            
            # Sort by match score
            results.sort(key=lambda x: x.get("match_score", 0), reverse=True)
            
            if results:
                print(f"Found {len(results)} matching resumes using {search_query.search_type} scoring")
                return results
            else:
                print(f"No matches found after {search_query.search_type} scoring attempts, returning mock data.")
                return mock_results_data # Fallback if no relevant results
        else:
            print("No user resumes found, returning mock data.")
            return mock_results_data

    except Exception as e:
        print(f"Error in search_resume: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Resume search failed: {str(e)}"}
        )

@app.get("/api/resumes")
async def get_all_resumes():
    """
    Get all resumes
    """
    try:
        # Return user resumes for now
        return await get_user_resumes()
    except Exception as e:
        print(f"Error in get_all_resumes: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to get resumes: {str(e)}"}
        )

@app.get("/api/resumes/download/{resume_id}")
async def download_resume(resume_id: str):
    """
    Download a resume by ID
    """
    try:
        # Find the resume in our in-memory storage
        resume = next((r for r in USER_RESUMES if r["id"] == resume_id), None)
        
        if not resume:
            return JSONResponse(
                status_code=404,
                content={"detail": f"Resume {resume_id} not found"}
            )
        
        # Look for the file in the storage directory
        storage_dir = Path("./storage/resumes")
        
        # Try to find the file with the resume ID prefix
        resume_files = list(storage_dir.glob(f"{resume_id}_*"))
        
        if not resume_files:
            # If no file found, return a mock PDF
            print(f"No file found for resume {resume_id}, returning mock PDF")
            mock_pdf_path = Path("./storage/mock_resume.pdf")
            
            # Create a mock PDF if it doesn't exist
            if not mock_pdf_path.exists():
                mock_pdf_path.parent.mkdir(parents=True, exist_ok=True)
                with open(mock_pdf_path, "wb") as f:
                    f.write(b"%PDF-1.5\n%Mock Resume PDF")
            
            return FileResponse(
                path=str(mock_pdf_path),
                filename=f"{resume['filename']}",
                media_type="application/pdf"
            )
        
        # Return the first matching file
        file_path = resume_files[0]
        return FileResponse(
            path=str(file_path),
            filename=resume["filename"],
            media_type="application/pdf"
        )
    except Exception as e:
        print(f"Error in download_resume: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to download resume: {str(e)}"}
        )

@app.delete("/api/resumes/{resume_id}")
async def delete_resume(resume_id: str):
    """
    Delete a resume by ID
    """
    try:
        global USER_RESUMES
        # Find the resume to delete
        resume_to_delete = next((r for r in USER_RESUMES if r["id"] == resume_id), None)
        if resume_to_delete:
            # Delete the file if it exists
            file_path = Path(resume_to_delete.get("file_path", ""))
            if file_path.exists():
                file_path.unlink()
            
            # Remove from storage
            USER_RESUMES = [r for r in USER_RESUMES if r["id"] != resume_id]
            save_resumes(USER_RESUMES)
            
        return {"status": "success", "message": f"Resume {resume_id} deleted successfully"}
    except Exception as e:
        print(f"Error in delete_resume: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to delete resume: {str(e)}"}
        )

@app.get("/download/{file_path:path}")
async def download_file(file_path: str):
    """
    Download a file from local storage
    """
    try:
        file_full_path = LOCAL_STORAGE_DIR / file_path
        if not file_full_path.exists():
            # Return a mock PDF for demo
            mock_file = LOCAL_STORAGE_DIR / "mock_resume.pdf"
            if not mock_file.exists():
                # Create an empty file
                with open(mock_file, "wb") as f:
                    f.write(b"Mock PDF content")
            
            return FileResponse(
                path=mock_file,
                filename="mock_resume.pdf",
                media_type="application/pdf"
            )
        
        return FileResponse(
            path=file_full_path,
            filename=file_full_path.name,
            media_type="application/pdf"
        )
    except Exception as e:
        print(f"Error in download_file: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to download file: {str(e)}"}
        )

# New endpoints for job description analysis and AI suggestions

@app.post("/api/job-description/analyze", response_model=JobDescriptionAnalysis)
async def analyze_job_description(file: UploadFile = File(...)):
    """
    Analyze a job description file and extract skills and requirements
    """
    try:
        # Save the uploaded file temporarily
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        try:
            contents = await file.read()
            with open(temp_file.name, "wb") as f:
                f.write(contents)
            
            # Extract text based on file type
            jd_text = ""
            if file.filename.lower().endswith(".pdf"):
                jd_text = extract_text_from_pdf(temp_file.name)
                if not jd_text or len(jd_text.strip()) < 100:
                    jd_text = extract_with_pdfplumber(temp_file.name)
            elif file.filename.lower().endswith((".doc", ".docx")):
                # For Word documents, we'll use a simple text extraction
                # In production, you'd want to use python-docx or similar
                jd_text = "Word document text extraction not implemented. Using mock analysis."
            elif file.filename.lower().endswith(".txt"):
                with open(temp_file.name, "r") as f:
                    jd_text = f.read()
            else:
                raise HTTPException(status_code=400, detail="Unsupported file format")
            
            # Analyze the job description text
            analysis = await analyze_job_description_text(jd_text)
            analysis["id"] = str(uuid.uuid4())
            analysis["filename"] = file.filename
            
            return analysis
            
        finally:
            # Clean up the temp file
            os.unlink(temp_file.name)
            
    except Exception as e:
        print(f"Error analyzing job description file: {str(e)}")
        # Return mock analysis for demo
        return JobDescriptionAnalysis(
            id=str(uuid.uuid4()),
            filename=file.filename,
            summary="Software Engineer position requiring full-stack development skills with focus on modern web technologies.",
            skills=["Python", "JavaScript", "React", "Node.js", "SQL", "AWS", "Git", "Docker"],
            requirements=["3+ years experience", "Bachelor's degree in Computer Science", "Experience with cloud platforms"],
            experience="3-5 years",
            category="Software Engineer"
        )

@app.post("/api/job-description/analyze-text", response_model=JobDescriptionAnalysis)
async def analyze_job_description_text_endpoint(request: dict):
    """
    Analyze job description text and extract skills and requirements
    """
    try:
        jd_text = request.get("text", "")
        if not jd_text.strip():
            raise HTTPException(status_code=400, detail="No text provided")
        
        analysis = await analyze_job_description_text(jd_text)
        analysis["id"] = str(uuid.uuid4())
        analysis["filename"] = "job-description.txt"
        
        return analysis
        
    except Exception as e:
        print(f"Error analyzing job description text: {str(e)}")
        # Return mock analysis for demo
        return JobDescriptionAnalysis(
            id=str(uuid.uuid4()),
            filename="job-description.txt",
            summary="Software Engineer position requiring full-stack development skills with focus on modern web technologies.",
            skills=["Python", "JavaScript", "React", "Node.js", "SQL", "AWS", "Git", "Docker"],
            requirements=["3+ years experience", "Bachelor's degree in Computer Science", "Experience with cloud platforms"],
            experience="3-5 years",
            category="Software Engineer"
        )

async def analyze_job_description_text(jd_text: str) -> dict:
    """
    Analyze job description text using AI or regex fallback
    """
    try:
        if OPENROUTER_API_AVAILABLE:
            # Use OpenRouter API for analysis
            prompt = f"""Analyze this job description and extract key information. Focus on extracting technical skills, tools, frameworks, and requirements mentioned in the role.

Please extract and return ONLY a JSON object with this exact structure:
{{
    "summary": "Brief 1-2 sentence summary of the role",
    "skills": ["list", "of", "technical", "skills", "tools", "frameworks"],
    "requirements": ["list", "of", "key", "requirements"],
    "experience": "X-Y years or specific experience level",
    "category": "Job Category/Title"
}}

Job Description Content:
{jd_text[:4000]}

Extract all technical skills, programming languages, frameworks, libraries, databases, tools, and technologies mentioned. Include both specific technologies (like Python, TensorFlow, MySQL) and general skills (like Machine Learning, NLP, Web Scraping)."""

            response = await get_openrouter_completion(prompt)
            
            # Try to parse the JSON response
            try:
                import json
                # Clean the response to extract JSON
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start != -1 and json_end != -1:
                    json_str = response[json_start:json_end]
                    return json.loads(json_str)
            except Exception as json_error:
                print(f"JSON parsing failed: {json_error}. Using regex fallback.")
        
        # Regex-based fallback analysis
        return analyze_job_description_with_regex(jd_text)
        
    except Exception as e:
        print(f"Error in analyze_job_description_text: {str(e)}")
        return analyze_job_description_with_regex(jd_text)

def analyze_job_description_with_regex(jd_text: str) -> dict:
    """
    Analyze job description using regex patterns
    """
    # Enhanced skill patterns to capture more technologies and frameworks
    skills = []
    skill_patterns = [
        # Programming Languages
        r'\b(?:Python|JavaScript|Java|React|Node\.js|Angular|Vue|SQL|NoSQL|MongoDB|PostgreSQL|MySQL|AWS|Azure|GCP|Docker|Kubernetes|Git|Linux|HTML|CSS|TypeScript|PHP|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|Flutter|Django|Flask|Express|Spring|Laravel|R|Scala|Matlab)\b',
        # ML/AI Technologies  
        r'\b(?:TensorFlow|PyTorch|Keras|Scikit-learn|Pandas|NumPy|Scipy|OpenCV|NLTK|spaCy|Gensim|CoreNLP|OpenNLP|LingPipe|Mallet|Theano|MLlib|Machine Learning|Deep Learning|NLP|Natural Language Processing|Computer Vision|Neural Networks)\b',
        # Data & Analytics
        r'\b(?:Spark|Hadoop|Kafka|Elasticsearch|Redis|Cassandra|HBase|BigQuery|Snowflake|Tableau|Power BI|Jupyter|Anaconda|Data Mining|ETL|Data Warehousing|Statistics|Analytics)\b',
        # Web Technologies
        r'\b(?:REST|GraphQL|API|Microservices|JSON|XML|HTTP|HTTPS|OAuth|JWT|WebSocket|Ajax|Bootstrap|Material UI|Webpack|Babel|NPM|Yarn)\b',
        # DevOps & Cloud
        r'\b(?:Jenkins|Travis|CircleCI|GitLab|GitHub|Terraform|Ansible|Chef|Puppet|Nagios|Prometheus|Grafana|ELK|Splunk|CloudFormation|Lambda|EC2|S3|RDS|DynamoDB)\b',
        # Databases
        r'\b(?:Oracle|SQL Server|MariaDB|SQLite|Neo4j|InfluxDB|TimescaleDB|Memcached|RabbitMQ|ActiveMQ|Apache Kafka)\b',
        # Scraping & Automation
        r'\b(?:Selenium|Scrapy|BeautifulSoup|Puppeteer|Playwright|Requests|Urllib|Mechanize|Web Scraping|Data Extraction|Automation|Bot|Crawler)\b',
        # Soft Skills & Methodologies
        r'\b(?:Agile|Scrum|Kanban|JIRA|Confluence|Slack|Teams|Communication|Leadership|Problem Solving|Critical Thinking|Analytical)\b'
    ]
    
    jd_lower = jd_text.lower()
    
    for pattern in skill_patterns:
        matches = re.findall(pattern, jd_text, re.IGNORECASE)
        for match in matches:
            if match not in [s.lower() for s in skills]:  # Avoid duplicates
                skills.append(match)
    
    # Special handling for compound terms that might be missed
    compound_skills = [
        ('sentiment analysis', 'Sentiment Analysis'),
        ('text mining', 'Text Mining'), 
        ('entity extraction', 'Entity Extraction'),
        ('document classification', 'Document Classification'),
        ('topic modeling', 'Topic Modeling'),
        ('natural language understanding', 'NLU'),
        ('natural language generation', 'NLG'),
        ('web scraping', 'Web Scraping'),
        ('data extraction', 'Data Extraction'),
        ('machine learning', 'Machine Learning'),
        ('deep learning', 'Deep Learning'),
        ('computer vision', 'Computer Vision'),
        ('data science', 'Data Science'),
        ('artificial intelligence', 'AI'),
        ('neural networks', 'Neural Networks'),
        ('supervised learning', 'Supervised Learning'),
        ('unsupervised learning', 'Unsupervised Learning'),
        ('reinforcement learning', 'Reinforcement Learning'),
        ('feature engineering', 'Feature Engineering'),
        ('model deployment', 'Model Deployment'),
        ('statistical analysis', 'Statistical Analysis'),
        ('data visualization', 'Data Visualization'),
        ('rest api', 'REST API'),
        ('restful api', 'RESTful API'),
        ('message queue', 'Message Queues'),
        ('proxy server', 'Proxy'),
        ('browser fingerprinting', 'Browser Fingerprinting'),
        ('bot detection', 'Bot Detection'),
        ('captcha solving', 'CAPTCHA'),
        ('web development', 'Web Development'),
        ('full stack', 'Full-Stack'),
        ('backend development', 'Backend Development'),
        ('frontend development', 'Frontend Development')
    ]
    
    for search_term, skill_name in compound_skills:
        if search_term in jd_lower and skill_name not in skills:
            skills.append(skill_name)
    
    # Extract experience requirements with more flexible patterns
    experience_patterns = [
        r'(\d+)[+\-\s]*(?:to\s+(\d+))?\s*years?\s*(?:of\s+)?(?:experience|exp)',
        r'(\d+)[+\-]\s*years?\s*(?:experience|exp)',
        r'minimum\s+(\d+)\s*years?',
        r'at least\s+(\d+)\s*years?'
    ]
    
    experience = "2-4 years"  # default based on your example
    for pattern in experience_patterns:
        match = re.search(pattern, jd_text, re.IGNORECASE)
        if match:
            min_exp = match.group(1)
            max_exp = match.group(2) if len(match.groups()) > 1 and match.group(2) else str(int(min_exp) + 2)
            experience = f"{min_exp}-{max_exp} years"
            break
    
    # Determine job category based on content
    category = "NLP Engineer"  # default for your example
    
    category_keywords = {
        'data scientist': ['data scientist', 'data science', 'analytics', 'statistical analysis'],
        'nlp engineer': ['nlp', 'natural language processing', 'text mining', 'sentiment analysis'],
        'machine learning engineer': ['machine learning', 'ml engineer', 'model deployment', 'deep learning'],
        'software engineer': ['software engineer', 'software development', 'programming'],
        'backend developer': ['backend', 'back-end', 'server-side', 'api development'],
        'frontend developer': ['frontend', 'front-end', 'ui', 'user interface'],
        'full-stack developer': ['full-stack', 'fullstack', 'full stack'],
        'devops engineer': ['devops', 'dev ops', 'deployment', 'infrastructure'],
        'web scraping specialist': ['web scraping', 'data extraction', 'scraping', 'crawling']
    }
    
    for cat, keywords in category_keywords.items():
        if any(keyword in jd_lower for keyword in keywords):
            category = cat.title()
            break
    
    # Generate summary based on extracted information
    role_sections = []
    if 'nlp' in jd_lower or 'natural language' in jd_lower:
        role_sections.append('NLP and machine learning')
    if 'scraping' in jd_lower or 'extraction' in jd_lower:
        role_sections.append('web scraping and data extraction')
    if 'model' in jd_lower and ('deployment' in jd_lower or 'training' in jd_lower):
        role_sections.append('model development and deployment')
    
    summary_skills = ', '.join(skills[:4]) if skills else 'various technologies'
    main_focus = ' and '.join(role_sections) if role_sections else 'software development'
    
    summary = f"{category} position focusing on {main_focus}, requiring {experience} experience with {summary_skills}."
    
    # Extract requirements from common patterns
    requirements = []
    
    # Education requirements
    if re.search(r'\b(?:bachelor|b\.s|bs|degree)\b', jd_text, re.IGNORECASE):
        requirements.append("Bachelor's degree")
    if re.search(r'\b(?:master|m\.s|ms)\b', jd_text, re.IGNORECASE):
        requirements.append("Master's degree preferred")
    if re.search(r'\b(?:phd|ph\.d|doctorate)\b', jd_text, re.IGNORECASE):
        requirements.append("PhD preferred")
    
    # Experience requirements
    if experience != "2-4 years":
        requirements.append(f"{experience} experience")
    
    # Technical requirements based on skills found
    if any('ML' in skill or 'Machine Learning' in skill for skill in skills):
        requirements.append("Machine Learning experience")
    if any('NLP' in skill or 'Natural Language' in skill for skill in skills):
        requirements.append("NLP/Text processing experience")
    if any('scraping' in skill.lower() or 'extraction' in skill.lower() for skill in skills):
        requirements.append("Web scraping experience")
    
    return {
        "summary": summary,
        "skills": skills[:20],  # Limit to top 20 skills to avoid overwhelming
        "requirements": requirements,
        "experience": experience,
        "category": category
    }

@app.post("/api/ai-suggestions")
async def get_ai_suggestions(request: AISuggestionsRequest):
    """
    Get AI suggestions for improving resume match with job description
    """
    try:
        resume_skills = request.resumeSkills
        jd_skills = request.jobDescriptionSkills
        resume_summary = request.resumeSummary
        
        if OPENROUTER_API_AVAILABLE:
            # Use OpenRouter API for AI suggestions
            prompt = f"""You are an expert career advisor. Analyze this candidate's resume against the job description requirements and provide specific, actionable suggestions.

RESUME SKILLS: {', '.join(resume_skills)}
JOB DESCRIPTION REQUIRED SKILLS: {', '.join(jd_skills)}
RESUME SUMMARY: {resume_summary}

Please provide a helpful analysis that:
1. Identifies which skills from the resume match well with the job requirements
2. Points out which job requirements are missing from the resume  
3. Gives specific, actionable advice for the candidate

Format your response in a conversational, encouraging tone. Be specific about technologies and skills. Keep it concise (2-3 sentences max) but actionable.

Example format: "Great match on [specific matching skills]! To strengthen your profile for this role, consider highlighting your experience with [missing skills] if you've used them in projects, or gaining experience in [specific missing technologies] which are key requirements for this position."""

            suggestions = await get_openrouter_completion(prompt)
            return {"suggestions": suggestions}
        
        # Fallback to rule-based suggestions
        matched_skills = []
        missing_skills = []
        
        for jd_skill in jd_skills:
            is_matched = any(jd_skill.lower() in resume_skill.lower() or 
                           resume_skill.lower() in jd_skill.lower() 
                           for resume_skill in resume_skills)
            if is_matched:
                matched_skills.append(jd_skill)
            else:
                missing_skills.append(jd_skill)
        
        if matched_skills and missing_skills:
            suggestions = f"Great match on {', '.join(matched_skills[:3])}! To strengthen your profile, consider highlighting experience with {', '.join(missing_skills[:3])} if you've used them in your projects but haven't mentioned them prominently in your resume."
        elif matched_skills:
            suggestions = f"Excellent skill alignment! Your expertise in {', '.join(matched_skills[:3])} makes you a strong candidate for this position."
        else:
            suggestions = f"While your background is valuable, consider developing skills in {', '.join(missing_skills[:3])} to better align with this role's requirements."
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        print(f"Error generating AI suggestions: {str(e)}")
        return {"suggestions": "Unable to generate suggestions at this time. Please try again later."}

async def get_openrouter_completion(prompt: str) -> str:
    """
    Get completion from OpenRouter API
    """
    try:
        from services.openrouter_service import get_openrouter_response
        response = await get_openrouter_response(prompt)
        return response
    except Exception as e:
        print(f"Error getting OpenRouter completion: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        # Create storage directory
        os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)
        
        # Set analyzer mode to regex since other options are removed
        if ANALYZER_MODE != "api":
            print("Setting analyzer mode to 'regex' as other options are not available")
            ANALYZER_MODE = "regex"
        
        # Run the app
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"Failed to start server: {str(e)}")