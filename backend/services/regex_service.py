import re
import json
import random
from typing import Dict, List, Any
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_resume_with_regex(resume_text: str) -> Dict[str, Any]:
    """
    Analyze a resume using regex pattern matching to extract key information.
    This is a fallback method when AI models are not available.
    
    Args:
        resume_text: The text content of the resume
        
    Returns:
        Dictionary containing extracted information
    """
    # Log a sample of the text for debugging
    logger.info(f"Analyzing resume with regex. Text sample (first 200 chars): {resume_text[:200].replace(chr(10), ' ')}")
    
    # Normalize text for better pattern matching
    normalized_text = resume_text.lower()
    
    # Clean the text - remove extra whitespace
    cleaned_text = re.sub(r'\s+', ' ', resume_text).strip()
    
    # Extract information using pattern matching
    skills = extract_skills(normalized_text, resume_text)
    experience_years = extract_experience(normalized_text, resume_text)
    education_level = extract_education_level(normalized_text, resume_text)
    job_category = determine_job_category(normalized_text, resume_text)
    
    # Generate a summary
    summary = generate_summary(resume_text, skills, experience_years, education_level, job_category)
    
    # Log the extracted information
    logger.info(f"Regex analysis results: {len(skills)} skills, {experience_years} years experience, {education_level} education, {job_category} category")
    
    # Return the results
    return {
        "summary": summary,
        "skills": skills,
        "experience": experience_years,
        "educationLevel": education_level,
        "category": job_category
    }

def normalize_text(text: str) -> str:
    """Normalize text for better analysis"""
    # Convert to lowercase
    text = text.lower()
    
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    
    # Replace newlines with spaces
    text = text.replace('\n', ' ')
    
    # Remove special characters that might interfere with regex
    text = re.sub(r'[^\w\s\.]', ' ', text)
    
    return text

def extract_experience(normalized_text: str, original_text: str) -> int:
    """
    Extract years of experience from resume text
    """
    # Pattern for direct mention of years of experience
    direct_patterns = [
        r'(\d+)\+?\s+years?(?:\s+of)?\s+experience',
        r'experience\s+(?:of\s+)?(\d+)\+?\s+years?',
        r'(?:over|more\s+than)\s+(\d+)\s+years?(?:\s+of)?\s+experience',
        r'(\d+)\s*\+\s*years?(?:\s+of)?\s+(?:industry|professional|work)',
    ]
    
    for pattern in direct_patterns:
        match = re.search(pattern, normalized_text)
        if match:
            # Direct mention found
            return int(match.group(1))
    
    # Try to calculate experience from job history
    job_dates = []
    
    # Pattern to find date ranges in work history
    date_patterns = [
        # Mon Year - Mon Year or Present format
        r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})\s*(?:–|-|to)\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})|present|current)',
        # Year - Year or Present format
        r'(\d{4})\s*(?:–|-|to)\s*(?:(\d{4})|present|current)',
    ]
    
    for pattern in date_patterns:
        matches = re.finditer(pattern, normalized_text, re.IGNORECASE)
        for match in matches:
            if match.group(2) and match.group(2).isdigit():
                # Both years are specified
                start_year = int(match.group(1))
                end_year = int(match.group(2))
                job_dates.append((start_year, end_year))
            else:
                # End date is "present" or similar
                start_year = int(match.group(1))
                current_year = datetime.now().year
                job_dates.append((start_year, current_year))
    
    # Calculate total experience
    if job_dates:
        # Sort by start date
        job_dates.sort()
        total_exp = 0
        current_span = None
        
        for start_year, end_year in job_dates:
            # Validate the date range
            if end_year < start_year:
                continue
                
            # If first job or no overlap with previous
            if current_span is None:
                current_span = (start_year, end_year)
                total_exp += end_year - start_year
            # Check for overlap
            elif start_year <= current_span[1]:
                # Extend current span if needed
                if end_year > current_span[1]:
                    total_exp += end_year - current_span[1]
                    current_span = (current_span[0], end_year)
            # No overlap, new span
            else:
                current_span = (start_year, end_year)
                total_exp += end_year - start_year
        
        # Return calculated experience
        return max(total_exp, 1)
    
    # Fallback: Check graduation date if present
    grad_patterns = [
        r'graduated\s+(?:in|on)?\s*(\d{4})',
        r'class\s+of\s+(\d{4})',
        r'(?:degree|diploma|certificate)\s+(?:received|awarded|conferred)\s+(?:in|on)?\s*(\d{4})'
    ]
    
    for pattern in grad_patterns:
        match = re.search(pattern, normalized_text)
        if match:
            grad_year = int(match.group(1))
            current_year = datetime.now().year
            # Check if graduation year is reasonable
            if 1980 <= grad_year <= current_year:
                return max(current_year - grad_year, 0)
    
    # Final fallback: Make an educated guess based on content volume and structure
    line_count = len(normalized_text.split('\n'))
    word_count = len(normalized_text.split())
    
    if line_count > 70 or word_count > 700:
        return 5  # Larger resume suggests more experience
    elif line_count > 50 or word_count > 500:
        return 3  # Medium-sized resume
    else:
        return 1  # Shorter resume suggests less experience

def extract_education_level(normalized_text: str, original_text: str) -> str:
    """
    Determine the highest level of education from resume text
    """
    # Define education levels and their keywords patterns
    education_patterns = {
        "PhD": r'\b(?:ph\.?d\.?|doctor\s+of\s+philosophy|doctoral)\b',
        "Master's": r'\b(?:master\'?s?|ms\.?|m\.s\.?|m\.a\.?|mba|m\.b\.a\.?)\b',
        "Bachelor's": r'\b(?:bachelor\'?s?|ba|b\.a\.?|bs|b\.s\.?|b\.e\.?|btech|b\.tech\.?)\b',
        "Associate's": r'\b(?:associate\'?s?|a\.a\.?|a\.s\.?|a\.a\.s\.?)\b',
        "High School": r'\b(?:high\s+school|secondary\s+school|diploma|g\.?e\.?d\.?)\b'
    }
    
    # Check for each education level in order of highest to lowest
    for level, pattern in education_patterns.items():
        if re.search(pattern, normalized_text, re.IGNORECASE):
            return level
    
    # If no education level is explicitly mentioned but college names are present
    college_patterns = [
        r'\b(?:university|college|institute|school)\s+of\b',
        r'\b(?:university|college|institute)\b'
    ]
    
    for pattern in college_patterns:
        if re.search(pattern, normalized_text, re.IGNORECASE):
            # Found a college reference but no specific degree
            # Default to Bachelor's as most common
            return "Bachelor's"
    
    # Default if no education information found
    return "High School"

def extract_skills(normalized_text: str, original_text: str) -> List[str]:
    """
    Extract skills from resume text
    """
    # Common technical skills and keywords
    tech_skills = [
        "python", "java", "javascript", "typescript", "c\\+\\+", "c#", "ruby", "php", "swift", "kotlin", "go", "rust",
        "html", "css", "sql", "nosql", "react", "angular", "vue", "node", "express", "django", "flask", "spring",
        "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "aws", "azure", "gcp", "docker", "kubernetes",
        "jenkins", "ci/cd", "git", "github", "gitlab", "bitbucket", "jira", "agile", "scrum", "kanban", "rest", "graphql",
        "api", "microservices", "serverless", "linux", "unix", "bash", "shell", "powershell", "mongodb", "mysql",
        "postgresql", "oracle", "redis", "elasticsearch", "hadoop", "spark", "kafka", "rabbitmq", "figma", "sketch",
        "photoshop", "illustrator", "ui/ux", "responsive design", "mobile development", "web development",
        "machine learning", "deep learning", "nlp", "computer vision", "data science", "data analysis",
        "data visualization", "tableau", "power bi", "excel", "vba", "matlab", "r", "scala", "blockchain",
        "cybersecurity", "networking", "cloud computing", "devops", "sysadmin", "testing", "qa", "automation"
    ]
    
    # Common soft skills
    soft_skills = [
        "communication", "teamwork", "leadership", "problem solving", "critical thinking", "time management",
        "project management", "analytical", "detail oriented", "creativity", "adaptability", "flexibility",
        "organization", "planning", "decision making", "conflict resolution", "negotiation", "presentation",
        "customer service", "interpersonal", "multitasking", "collaboration", "mentoring", "coaching"
    ]
    
    # Combine all skills to search for
    all_skills = tech_skills + soft_skills
    
    # Find skills in the text
    found_skills = []
    for skill in all_skills:
        if re.search(r'\b' + skill + r'\b', normalized_text, re.IGNORECASE):
            # Convert to title case for better presentation
            words = skill.split()
            titled_skill = ' '.join(word.capitalize() if word.lower() not in ['and', 'or', 'the', 'of', 'in', 'on', 'at'] else word for word in words)
            found_skills.append(titled_skill)
    
    # Look for skills sections
    skills_section_patterns = [
        r'(?:technical\s+)?skills\s*(?::|&|•|\n)(.*?)(?:\n\n|\n[A-Z])',
        r'(?:technical|professional)\s+skills(.*?)(?:\n\n|\n[A-Z])',
        r'(?:expertise|proficiencies|competencies)(.*?)(?:\n\n|\n[A-Z])'
    ]
    
    for pattern in skills_section_patterns:
        match = re.search(pattern, original_text, re.IGNORECASE | re.DOTALL)
        if match:
            skills_text = match.group(1)
            # Extract individual skills from lists (comma or bullet separated)
            skill_items = re.split(r'[,•]|\s{2,}', skills_text)
            for item in skill_items:
                item = item.strip()
                if item and len(item) > 2 and item.lower() not in [s.lower() for s in found_skills]:
                    # Avoid adding duplicates and very short items
                    found_skills.append(item)
    
    # Deduplicate and limit the number of skills
    unique_skills = []
    for skill in found_skills:
        if skill not in unique_skills:
            unique_skills.append(skill)
    
    # Limit to a reasonable number
    return unique_skills[:15] if len(unique_skills) > 15 else unique_skills

def determine_job_category(normalized_text: str, original_text: str) -> str:
    """
    Determine the job category based on resume content
    """
    # Define job categories and their associated keywords
    job_categories = {
        "Software Engineering": [
            "software engineer", "developer", "programmer", "coding", "software development",
            "web developer", "full stack", "frontend", "backend", "mobile developer", "app developer",
            "devops", "software architect", "programming", "coder"
        ],
        "Data Science": [
            "data scientist", "machine learning", "deep learning", "ai", "artificial intelligence",
            "data mining", "statistical analysis", "data analytics", "big data", "data modeling",
            "predictive modeling", "nlp", "natural language processing", "computer vision"
        ],
        "Design": [
            "designer", "ui", "ux", "user interface", "user experience", "graphic design",
            "web design", "product design", "visual design", "interaction design", "creative"
        ],
        "Marketing": [
            "marketing", "digital marketing", "seo", "sem", "social media", "content marketing",
            "brand", "advertising", "market research", "growth hacking", "marketing strategy",
            "marketing campaign", "marketing manager"
        ],
        "Sales": [
            "sales", "account executive", "business development", "sales representative",
            "account manager", "sales manager", "client acquisition", "revenue generation",
            "sales strategy", "customer acquisition", "lead generation"
        ],
        "Finance": [
            "finance", "financial", "accounting", "accountant", "financial analyst",
            "investment", "banking", "portfolio", "financial planning", "budget", "auditing",
            "tax", "cpa", "chartered accountant"
        ],
        "Healthcare": [
            "healthcare", "medical", "doctor", "nurse", "physician", "clinical",
            "patient care", "health", "hospital", "pharmacy", "pharmaceutical",
            "healthcare management", "medical professional"
        ],
        "Education": [
            "education", "teacher", "professor", "instructor", "teaching", "tutor",
            "curriculum", "academic", "school", "university", "college", "faculty",
            "educational", "lecturer", "training"
        ],
        "Human Resources": [
            "hr", "human resources", "recruiting", "recruitment", "talent acquisition",
            "hiring", "personnel", "hr manager", "benefits", "compensation", "employee relations",
            "hr specialist", "human capital"
        ],
        "Project Management": [
            "project manager", "project management", "program manager", "scrum master",
            "agile", "pmp", "prince2", "project coordination", "project delivery",
            "project planning", "project lead"
        ],
        "Operations": [
            "operations", "operations manager", "supply chain", "logistics", "procurement",
            "inventory management", "warehouse", "production", "operational excellence",
            "process improvement", "business operations"
        ]
    }
    
    # Count matches for each category
    category_scores = {}
    for category, keywords in job_categories.items():
        score = 0
        for keyword in keywords:
            matches = re.findall(r'\b' + re.escape(keyword) + r'\b', normalized_text, re.IGNORECASE)
            score += len(matches)
        category_scores[category] = score
    
    # Find the category with the highest score
    max_score = 0
    best_category = "Professional"  # Default category
    
    for category, score in category_scores.items():
        if score > max_score:
            max_score = score
            best_category = category
    
    # If no strong match, try to determine from job titles
    if max_score < 3:
        job_title_patterns = [
            r'(?:^|\n)(?:title|position):\s*(.*?)(?:\n|$)',
            r'(?:^|\n)(.*?)(?:\n|$)',  # Try to get the first line as a potential job title
            r'\b(?:senior|junior|lead|principal|staff|chief|head|director\s+of)\s+(.*?engineer|.*?developer|.*?scientist|.*?analyst|.*?manager|.*?designer)\b'
        ]
        
        for pattern in job_title_patterns:
            match = re.search(pattern, original_text, re.IGNORECASE)
            if match:
                title = match.group(1).lower()
                # Check which category this title might belong to
                for category, keywords in job_categories.items():
                    for keyword in keywords:
                        if keyword in title:
                            return category
    
    return best_category

def generate_summary(resume_text: str, skills: List[str], experience_years: int, education_level: str, job_category: str) -> str:
    """
    Generate a professional summary based on extracted information
    """
    # Start with a template based on job category and experience
    templates = [
        "{category} professional with {experience} years of experience and {education} education. Skilled in {skills}.",
        "Experienced {category} specialist with {education}-level education and {experience} years in the field. Proficient in {skills}.",
        "{education}-educated {category} expert with {experience} years of professional experience. Strong background in {skills}.",
        "Dedicated {category} professional with {experience}+ years of hands-on experience. {Education} graduate with expertise in {skills}.",
        "Results-driven {category} specialist with {education} degree and {experience} years of industry experience. Skilled in {skills}."
    ]
    
    # Select a random template
    template = random.choice(templates)
    
    # Format experience years text
    if experience_years == 1:
        exp_text = "1"
    elif experience_years < 3:
        exp_text = "2-3"
    elif experience_years < 5:
        exp_text = "3-5"
    elif experience_years < 8:
        exp_text = "5-7"
    elif experience_years < 12:
        exp_text = "8-10"
    else:
        exp_text = "10+"
    
    # Format skills text (use top 3-5 skills)
    num_skills = min(len(skills), random.randint(3, 5) if len(skills) >= 3 else len(skills))
    selected_skills = skills[:num_skills]
    
    if len(selected_skills) >= 2:
        skills_text = ", ".join(selected_skills[:-1]) + " and " + selected_skills[-1]
    elif len(selected_skills) == 1:
        skills_text = selected_skills[0]
    else:
        skills_text = "various technical and professional competencies"
    
    # Fill in the template
    summary = template.format(
        category=job_category,
        experience=exp_text,
        education=education_level,
        skills=skills_text,
        Education=education_level  # Capitalized version for sentence starts
    )
    
    return summary 