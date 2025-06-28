import os
import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import sqlite3
from .embedding_service import get_embedding, rank_documents_by_query

# For Supabase integration (optional)
try:
    from supabase import create_client, Client
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    SUPABASE_ENABLED = SUPABASE_URL and SUPABASE_KEY
except ImportError:
    SUPABASE_ENABLED = False

# Initialize database
DB_PATH = Path("./storage/resumes.db")
DB_PATH.parent.mkdir(exist_ok=True)

def init_db():
    """Initialize the SQLite database with required tables"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # Create resumes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        file_path TEXT NOT NULL,
        download_url TEXT NOT NULL,
        summary TEXT,
        skills TEXT,
        experience INTEGER,
        education_level TEXT,
        category TEXT,
        created_at TEXT,
        embedding TEXT
    )
    ''')

    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT,
        is_verified INTEGER DEFAULT 0,
        google_id TEXT,
        created_at TEXT
    )
    ''')

    # Create email verification tokens table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        created_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

async def save_resume_to_db(
    resume_text: str,
    metadata: Dict[str, Any],
    file_path: str,
    download_url: str
) -> str:
    """
    Save resume data to database with embedding
    
    Args:
        resume_text: Extracted text from the resume
        metadata: Resume metadata (summary, skills, etc.)
        file_path: Path to the stored file
        download_url: URL to download the file
        
    Returns:
        ID of the saved resume
    """
    try:
        # Generate embedding for the resume
        embedding = await get_embedding(resume_text[:2000])  # Truncate to avoid token limits
        
        # Generate ID
        resume_id = str(uuid.uuid4())
        
        # Process metadata
        skills = metadata.get("skills", [])
        if isinstance(skills, list):
            skills_json = json.dumps(skills)
        else:
            skills_json = json.dumps([])
        
        # Connect to database
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        # Insert resume
        cursor.execute(
            """
            INSERT INTO resumes
            (id, file_path, download_url, summary, skills, experience, education_level, category, created_at, embedding)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                resume_id,
                file_path,
                download_url,
                metadata.get("summary", ""),
                skills_json,
                metadata.get("experience", 0),
                metadata.get("educationLevel", ""),
                metadata.get("category", ""),
                datetime.now().isoformat(),
                json.dumps(embedding)
            )
        )
        
        conn.commit()
        conn.close()
        
        return resume_id
        
    except Exception as e:
        print(f"Error saving resume to database: {str(e)}")
        raise

async def get_resumes() -> List[Dict[str, Any]]:
    """
    Get all resumes from database
    
    Returns:
        List of resume data
    """
    try:
        # Connect to database
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        cursor = conn.cursor()
        
        # Get all resumes
        cursor.execute("SELECT * FROM resumes ORDER BY created_at DESC")
        rows = cursor.fetchall()
        
        # Process results
        resumes = []
        for row in rows:
            resume = dict(row)
            
            # Parse JSON fields
            resume["skills"] = json.loads(resume["skills"]) if resume["skills"] else []
            
            # Remove embedding from response
            if "embedding" in resume:
                del resume["embedding"]
                
            resumes.append(resume)
            
        conn.close()
        
        return resumes
        
    except Exception as e:
        print(f"Error getting resumes: {str(e)}")
        return []

async def search_resumes(
    query_embedding: List[float],
    filters: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Search resumes by embedding similarity and filters
    
    Args:
        query_embedding: Embedding of the search query
        filters: Optional filters (experience, education, category)
        
    Returns:
        List of matching resumes
    """
    try:
        # Connect to database
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        cursor = conn.cursor()
        
        # Get all resumes
        cursor.execute("SELECT * FROM resumes")
        rows = cursor.fetchall()
        
        # Process results
        resumes = []
        for row in rows:
            resume = dict(row)
            
            # Parse JSON fields
            resume["skills"] = json.loads(resume["skills"]) if resume["skills"] else []
            resume["embedding"] = json.loads(resume["embedding"]) if resume["embedding"] else []
            
            # Apply filters if provided
            if filters:
                # Filter by minimum experience
                if "minExperience" in filters and resume["experience"] < filters["minExperience"]:
                    continue
                    
                # Filter by education level
                if "educationLevel" in filters and resume["education_level"] != filters["educationLevel"]:
                    continue
                    
                # Filter by category
                if "category" in filters and resume["category"] != filters["category"]:
                    continue
                    
                # Filter by skills
                if "skills" in filters and isinstance(filters["skills"], list) and filters["skills"]:
                    resume_skills = set(s.lower() for s in resume["skills"])
                    filter_skills = set(s.lower() for s in filters["skills"])
                    if not filter_skills.intersection(resume_skills):
                        continue
            
            resumes.append(resume)
        
        conn.close()
        
        # Rank by similarity
        if resumes:
            ranked_resumes = await rank_documents_by_query(query_embedding, resumes)
            
            # Process for response (remove embedding, format fields)
            for resume in ranked_resumes:
                if "embedding" in resume:
                    del resume["embedding"]
                    
                # Calculate match score (0-100)
                if "similarity" in resume:
                    resume["match_score"] = int(resume["similarity"] * 100)
                    del resume["similarity"]
                
                # Generate match reason
                resume["match_reason"] = generate_match_reason(resume)
                
            return ranked_resumes[:5]  # Return top 5
        else:
            return []
        
    except Exception as e:
        print(f"Error searching resumes: {str(e)}")
        return []

def generate_match_reason(resume: Dict[str, Any]) -> str:
    """Generate a human-readable match reason"""
    reasons = []
    
    if resume.get("category"):
        reasons.append(f"Matching job category: {resume['category']}.")
        
    if resume.get("skills") and len(resume["skills"]) > 0:
        top_skills = resume["skills"][:3]
        reasons.append(f"Has relevant skills: {', '.join(top_skills)}.")
        
    if resume.get("experience"):
        reasons.append(f"{resume['experience']} years of experience.")
        
    if resume.get("education_level"):
        reasons.append(f"{resume['education_level']} degree.")
        
    if reasons:
        return " ".join(reasons)
    else:
        return "Matching content in resume." 