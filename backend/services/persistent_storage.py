"""
Persistent storage service for resumes using PostgreSQL or JSON fallback.
Handles storage persistence across container restarts for production deployments.
"""
import os
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

# Database imports - optional
try:
    import psycopg2
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False
    print("PostgreSQL dependencies not available, using JSON file storage")

class PersistentStorage:
    def __init__(self):
        self.storage_type = self._determine_storage_type()
        self.local_storage_dir = Path("./storage")
        self.local_storage_dir.mkdir(parents=True, exist_ok=True)
        self.resumes_file = self.local_storage_dir / "resumes.json"
        
        if self.storage_type == "postgres":
            self._init_postgres()
        
        print(f"Initialized persistent storage: {self.storage_type}")
    
    def _determine_storage_type(self) -> str:
        """Determine which storage backend to use based on environment"""
        # Check for PostgreSQL connection string
        postgres_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
        if postgres_url and POSTGRES_AVAILABLE:
            return "postgres"
        
        # Fallback to JSON file storage
        return "json"
    
    def _init_postgres(self):
        """Initialize PostgreSQL connection and create tables if needed"""
        try:
            database_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
            self.engine = create_engine(database_url)
            
            # Create resumes table if it doesn't exist
            with self.engine.connect() as conn:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS resumes (
                        id VARCHAR(255) PRIMARY KEY,
                        filename VARCHAR(255) NOT NULL,
                        upload_date TIMESTAMP NOT NULL,
                        status VARCHAR(50) DEFAULT 'processed',
                        summary TEXT,
                        skills TEXT,  -- JSON array as text
                        experience VARCHAR(50),
                        education_level VARCHAR(100),
                        category VARCHAR(100),
                        file_path VARCHAR(500),
                        download_url VARCHAR(500),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                conn.commit()
            
            print("PostgreSQL storage initialized successfully")
        except Exception as e:
            print(f"Failed to initialize PostgreSQL: {e}")
            print("Falling back to JSON file storage")
            self.storage_type = "json"
    
    def save_resumes(self, resumes: List[Dict[str, Any]]) -> bool:
        """Save resumes to persistent storage"""
        try:
            if self.storage_type == "postgres":
                return self._save_to_postgres(resumes)
            else:
                return self._save_to_json(resumes)
        except Exception as e:
            print(f"Error saving resumes: {e}")
            return False
    
    def load_resumes(self) -> List[Dict[str, Any]]:
        """Load resumes from persistent storage"""
        try:
            if self.storage_type == "postgres":
                return self._load_from_postgres()
            else:
                return self._load_from_json()
        except Exception as e:
            print(f"Error loading resumes: {e}")
            return []
    
    def add_resume(self, resume: Dict[str, Any]) -> bool:
        """Add a single resume to storage"""
        try:
            if self.storage_type == "postgres":
                return self._add_resume_to_postgres(resume)
            else:
                # For JSON, load all, add, and save
                resumes = self.load_resumes()
                resumes.append(resume)
                return self.save_resumes(resumes)
        except Exception as e:
            print(f"Error adding resume: {e}")
            return False
    
    def delete_resume(self, resume_id: str) -> bool:
        """Delete a resume from storage"""
        try:
            if self.storage_type == "postgres":
                return self._delete_from_postgres(resume_id)
            else:
                resumes = self.load_resumes()
                resumes = [r for r in resumes if r.get("id") != resume_id]
                return self.save_resumes(resumes)
        except Exception as e:
            print(f"Error deleting resume: {e}")
            return False
    
    def _save_to_postgres(self, resumes: List[Dict[str, Any]]) -> bool:
        """Save resumes to PostgreSQL"""
        try:
            with self.engine.connect() as conn:
                # Clear existing data and insert new
                conn.execute(text("DELETE FROM resumes"))
                
                for resume in resumes:
                    skills_json = json.dumps(resume.get("skills", []))
                    
                    conn.execute(text("""
                        INSERT INTO resumes (
                            id, filename, upload_date, status, summary, skills,
                            experience, education_level, category, file_path, download_url
                        ) VALUES (
                            :id, :filename, :upload_date, :status, :summary, :skills,
                            :experience, :education_level, :category, :file_path, :download_url
                        )
                    """), {
                        "id": resume.get("id"),
                        "filename": resume.get("filename"),
                        "upload_date": resume.get("upload_date"),
                        "status": resume.get("status", "processed"),
                        "summary": resume.get("summary"),
                        "skills": skills_json,
                        "experience": resume.get("experience"),
                        "education_level": resume.get("educationLevel"),
                        "category": resume.get("category"),
                        "file_path": resume.get("file_path"),
                        "download_url": resume.get("download_url")
                    })
                
                conn.commit()
            return True
        except Exception as e:
            print(f"Error saving to PostgreSQL: {e}")
            return False
    
    def _load_from_postgres(self) -> List[Dict[str, Any]]:
        """Load resumes from PostgreSQL"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT * FROM resumes ORDER BY upload_date DESC"))
                resumes = []
                
                for row in result:
                    resume = {
                        "id": row.id,
                        "filename": row.filename,
                        "upload_date": row.upload_date.isoformat() if row.upload_date else None,
                        "status": row.status,
                        "summary": row.summary,
                        "skills": json.loads(row.skills) if row.skills else [],
                        "experience": row.experience,
                        "educationLevel": row.education_level,
                        "category": row.category,
                        "file_path": row.file_path,
                        "download_url": row.download_url
                    }
                    resumes.append(resume)
                
                return resumes
        except Exception as e:
            print(f"Error loading from PostgreSQL: {e}")
            return []
    
    def _add_resume_to_postgres(self, resume: Dict[str, Any]) -> bool:
        """Add a single resume to PostgreSQL"""
        try:
            with self.engine.connect() as conn:
                skills_json = json.dumps(resume.get("skills", []))
                
                conn.execute(text("""
                    INSERT INTO resumes (
                        id, filename, upload_date, status, summary, skills,
                        experience, education_level, category, file_path, download_url
                    ) VALUES (
                        :id, :filename, :upload_date, :status, :summary, :skills,
                        :experience, :education_level, :category, :file_path, :download_url
                    )
                """), {
                    "id": resume.get("id"),
                    "filename": resume.get("filename"),
                    "upload_date": resume.get("upload_date"),
                    "status": resume.get("status", "processed"),
                    "summary": resume.get("summary"),
                    "skills": skills_json,
                    "experience": resume.get("experience"),
                    "education_level": resume.get("educationLevel"),
                    "category": resume.get("category"),
                    "file_path": resume.get("file_path"),
                    "download_url": resume.get("download_url")
                })
                
                conn.commit()
            return True
        except Exception as e:
            print(f"Error adding resume to PostgreSQL: {e}")
            return False
    
    def _delete_from_postgres(self, resume_id: str) -> bool:
        """Delete a resume from PostgreSQL"""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("DELETE FROM resumes WHERE id = :id"), {"id": resume_id})
                conn.commit()
            return True
        except Exception as e:
            print(f"Error deleting from PostgreSQL: {e}")
            return False
    
    def _save_to_json(self, resumes: List[Dict[str, Any]]) -> bool:
        """Save resumes to JSON file (fallback)"""
        try:
            with open(self.resumes_file, 'w') as f:
                json.dump(resumes, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving to JSON: {e}")
            return False
    
    def _load_from_json(self) -> List[Dict[str, Any]]:
        """Load resumes from JSON file (fallback)"""
        if self.resumes_file.exists():
            try:
                with open(self.resumes_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading from JSON: {e}")
        return []

# Global storage instance
storage = PersistentStorage()
