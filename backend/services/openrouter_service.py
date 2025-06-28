import os
import json
import requests
import logging
import re
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
import random
import httpx

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables with force reload
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

# OpenRouter API settings - load from environment but with fallbacks
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "mistralai/mistral-7b-instruct:free")
OPENROUTER_CHAT_COMPLETIONS_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL_NAME = os.getenv("OPENROUTER_MODEL_NAME", "mistralai/mistral-7b-instruct:free")

# Print the API key for debugging (first 10 chars and last 5 chars only for security)
logger.info(f"Loaded OpenRouter API key: {OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-5:]}")
logger.info(f"Using model: {OPENROUTER_MODEL}")

# Log the API key being used (first 10 chars and last 5 chars only for security)
logger.info(f"Using OpenRouter API key: {OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-5:]}")
logger.info(f"API key length: {len(OPENROUTER_API_KEY)} characters")


def analyze_resume_with_openrouter(resume_text: str, fallback_to_mock: bool = True) -> Dict[str, Any]:
    """
    Analyze a resume using the OpenRouter API with Mistral model
    
    Args:
        resume_text: The text of the resume to analyze
        fallback_to_mock: Whether to fall back to mock data if the API call fails
        
    Returns:
        Dict containing the analysis results or mock data if fallback_to_mock is True
    """
    logger.info("Starting OpenRouter API resume analysis with Mistral model")
    
    # Clean and truncate text if needed
    # Truncate to ~6000 characters to be safe
    max_chars = 6000
    if len(resume_text) > max_chars:
        logger.info(f"Truncating resume text from {len(resume_text)} to {max_chars} characters")
        resume_text = resume_text[:max_chars]
    
    # Create a structured prompt for better extraction
    system_prompt = """You are an expert AI resume analyzer with years of experience in HR and recruitment. 
    Your task is to carefully analyze resumes and extract accurate, detailed information about the candidate's skills, 
    experience, education, and professional background. Be thorough, precise, and focus on extracting factual information 
    directly from the resume text without making assumptions or adding information not present in the resume.
    
    When analyzing skills, identify both technical and soft skills mentioned in the resume.
    When determining years of experience, calculate based on the work history dates provided.
    When identifying education level, look for the highest degree mentioned.
    When determining job category, consider the candidate's most recent roles and overall experience.
    
    Your analysis should be objective, accurate, and based solely on the information provided in the resume."""
    
    user_prompt = f"""Analyze the following resume text and extract key information.

RESUME TEXT:
{resume_text}

Based on the resume above, extract and return ONLY the following information in JSON format:

1. summary: A professional summary of the candidate (3-4 sentences) that highlights their key qualifications, experience, and strengths. Make this detailed and specific to the candidate.

2. skills: An array of ALL professional skills mentioned in the resume, including technical skills, soft skills, tools, programming languages, frameworks, methodologies, etc. Be comprehensive and include everything mentioned.

3. experience: The total years of professional experience as a number (integer). Calculate this based on the work history dates in the resume. If exact dates aren't provided, make a reasonable estimate based on the information available.

4. educationLevel: The highest level of education attained (High School, Associate's, Bachelor's, Master's, PhD, or Other). Look for specific degrees mentioned.

5. category: The job category or industry that best matches this resume based on the candidate's experience and skills (e.g., Software Engineering, Data Science, Marketing, Finance, Healthcare, etc.). Be specific.

Format your response as a valid JSON object with these five keys. DO NOT include any explanations before or after the JSON. Ensure the JSON is properly formatted and valid."""
    
    # Set up the headers with authentication - try a different approach
    # Remove 'Bearer ' prefix if it's already in the key
    api_key = OPENROUTER_API_KEY
    if api_key.startswith("Bearer "):
        api_key = api_key[7:]
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Log the headers for debugging
    logger.info(f"Using Authorization header: Bearer {api_key[:10]}...{api_key[-5:]}")
    logger.info(f"Full API key being used: {api_key}")
    logger.info(f"Using Content-Type: {headers['Content-Type']}")
    logger.info(f"API key length: {len(api_key)} characters")
    
    
    # Prepare the payload
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 500,
        "temperature": 0.1,
        "top_p": 0.95
    }
    
    try:
        # Make the API call
        logger.info(f"Sending request to OpenRouter API with model: {OPENROUTER_MODEL}")
        logger.info(f"API URL: {OPENROUTER_API_URL}")
        logger.info(f"API Key (first 10 chars): {OPENROUTER_API_KEY[:10]}...")
        logger.info(f"Headers: {headers}")
        logger.info(f"Payload: {json.dumps(payload)[:500]}...")
        
        # Set a timeout to avoid hanging indefinitely
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
        
        # Log the response status and headers
        logger.info(f"Response status code: {response.status_code}")
        logger.info(f"Response headers: {response.headers}")
        
        # Handle different response status codes
        if response.status_code == 200:
            # Success! Parse the response
            result = response.json()
            logger.info("Received successful response from OpenRouter API")
            
            # Extract the generated text
            if "choices" in result and len(result["choices"]) > 0:
                generated_text = result["choices"][0]["message"]["content"]
                
                # Clean up any markdown formatting (```json)
                if "```json" in generated_text or "```" in generated_text:
                    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', generated_text)
                    if json_match:
                        generated_text = json_match.group(1).strip()
                
                # Clean up any other potential formatting issues
                if not generated_text.strip().startswith("{"):
                    # If it doesn't start with {, try to find JSON within the text
                    json_start = generated_text.find("{")
                    json_end = generated_text.rfind("}")
                    if json_start >= 0 and json_end > json_start:
                        generated_text = generated_text[json_start:json_end+1]
                
                logger.info(f"Cleaned JSON text: {generated_text[:100]}...")
                
                try:
                    # Log the full generated text for debugging
                    logger.info(f"Full generated text: {generated_text}")
                    
                    # Parse the JSON with better error handling
                    try:
                        parsed_result = json.loads(generated_text)
                    except json.JSONDecodeError as json_err:
                        logger.error(f"JSON parsing error: {json_err}")
                        logger.error(f"Problematic JSON: {generated_text}")
                        
                        # Try to fix common JSON issues
                        fixed_text = generated_text
                        # Replace single quotes with double quotes
                        fixed_text = fixed_text.replace("'", "\"")
                        # Ensure property names are double-quoted
                        fixed_text = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', fixed_text)
                        
                        logger.info(f"Attempting to parse fixed JSON: {fixed_text}")
                        try:
                            parsed_result = json.loads(fixed_text)
                        except json.JSONDecodeError:
                            # If still failing, create a default response
                            logger.error("Still failed to parse JSON after fixes, using default response")
                            parsed_result = {
                                "summary": "Failed to parse LLM response. The model returned invalid JSON.",
                                "skills": ["Error parsing response"],
                                "experience": 0,
                                "educationLevel": "Unknown",
                                "category": "Error"
                            }
                    
                    # Validate that we have all the required fields
                    required_fields = ["summary", "skills", "experience", "educationLevel", "category"]
                    for field in required_fields:
                        if field not in parsed_result:
                            logger.warning(f"Missing required field in response: {field}")
                            if field == "skills":
                                parsed_result[field] = []
                            elif field == "experience":
                                parsed_result[field] = 0
                            else:
                                parsed_result[field] = ""
                    
                    # Ensure skills is a list
                    if not isinstance(parsed_result["skills"], list):
                        logger.warning(f"Skills is not a list: {parsed_result['skills']}")
                        try:
                            if isinstance(parsed_result["skills"], str):
                                parsed_result["skills"] = [s.strip() for s in parsed_result["skills"].split(",")]
                            else:
                                parsed_result["skills"] = [str(parsed_result["skills"])]
                        except Exception as e:
                            logger.error(f"Error converting skills to list: {e}")
                            parsed_result["skills"] = ["Error parsing skills"]
                    
                    # Ensure experience is a number
                    if not isinstance(parsed_result["experience"], (int, float)):
                        logger.warning(f"Experience is not a number: {parsed_result['experience']}")
                        try:
                            # Try to extract a number from the experience field
                            if isinstance(parsed_result["experience"], str):
                                # Try to find a number in the string
                                num_match = re.search(r'\d+', parsed_result["experience"])
                                if num_match:
                                    parsed_result["experience"] = int(num_match.group())
                                else:
                                    parsed_result["experience"] = 0
                            else:
                                parsed_result["experience"] = 0
                        except Exception as e:
                            logger.error(f"Error converting experience to number: {e}")
                            parsed_result["experience"] = 0
                    
                    # Standardize educationLevel to match expected values
                    edu_level = parsed_result["educationLevel"].lower()
                    if "master" in edu_level:
                        parsed_result["educationLevel"] = "Master's"
                    elif "bachelor" in edu_level or "bs" in edu_level or "ba" in edu_level:
                        parsed_result["educationLevel"] = "Bachelor's"
                    elif "phd" in edu_level or "doctor" in edu_level:
                        parsed_result["educationLevel"] = "PhD"
                    elif "associate" in edu_level:
                        parsed_result["educationLevel"] = "Associate's"
                    elif "high school" in edu_level:
                        parsed_result["educationLevel"] = "High School"
                    
                    logger.info(f"Successfully extracted {len(parsed_result.get('skills', []))} skills")
                    return parsed_result
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON from response: {e}")
                    logger.debug(f"Raw response: {generated_text}")
                    raise ValueError(f"Failed to parse analysis result: {e}")
            else:
                logger.error("Unexpected response format from OpenRouter API")
                raise ValueError("Received unexpected response format from OpenRouter API")
        
        elif response.status_code == 401:
            error_msg = "Authentication failed with OpenRouter API. Please check your API key or try regenerating it."
            logger.error(f"Authentication failed with OpenRouter API (401): {response.text}")
            
            if fallback_to_mock:
                logger.warning("Falling back to mock data due to authentication error")
                return generate_mock_analysis(resume_text)
            else:
                raise Exception(error_msg)
        
        elif response.status_code == 403:
            logger.error(f"Permission denied by OpenRouter API (403): {response.text}")
            raise ValueError("Permission denied by OpenRouter API. Your API key might not have access to the requested model.")
        
        elif response.status_code == 429:
            logger.error(f"Rate limit exceeded on OpenRouter API (429): {response.text}")
            raise ValueError("Rate limit exceeded on OpenRouter API. Please try again later or reduce the frequency of requests.")
        
        elif response.status_code == 503:
            logger.error(f"OpenRouter API service unavailable (503): {response.text}")
            raise ValueError("OpenRouter API service is currently unavailable. Please try again later.")
        
        else:
            logger.error(f"API call failed with status code {response.status_code}: {response.text}")
            raise ValueError(f"API call failed with status code {response.status_code}: {response.text}")
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request to OpenRouter API failed: {e}")
        raise ValueError(f"Failed to connect to OpenRouter API: {e}")
    
    except Exception as e:
        logger.error(f"Unexpected error in resume analysis: {e}")
        raise ValueError(f"Resume analysis failed: {e}")


def generate_mock_analysis(resume_text: str) -> Dict[str, Any]:
    """
    Generate mock analysis data when the OpenRouter API fails
    This function extracts basic information from the resume text using regex
    and returns a structured response similar to what the API would return
    
    Args:
        resume_text: The text of the resume to analyze
        
    Returns:
        Dict containing mock analysis results
    """
    logger.info("Generating mock analysis data")
    
    # Extract some basic information from the resume text using regex
    import re
    
    # Extract skills (look for common skill keywords)
    skill_keywords = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "HTML", "CSS",
        "Java", "C++", "C#", "SQL", "MongoDB", "AWS", "Azure", "Docker", "Kubernetes",
        "Git", "CI/CD", "Agile", "Scrum", "Project Management", "Leadership",
        "Communication", "Problem Solving", "Critical Thinking", "Teamwork"
    ]
    
    # Find skills mentioned in the resume
    skills = []
    for skill in skill_keywords:
        if re.search(r'\b' + re.escape(skill) + r'\b', resume_text, re.IGNORECASE):
            skills.append(skill)
    
    # If no skills found, add some generic ones
    if not skills:
        skills = ["Communication", "Problem Solving", "Teamwork", "Technical Skills"]
    
    # Try to extract education level
    education_level = "Bachelor's"
    if re.search(r'\b(PhD|Doctor|Doctorate)\b', resume_text, re.IGNORECASE):
        education_level = "PhD"
    elif re.search(r'\b(Master|MS|M\.S\.|MBA|M\.B\.A\.)\b', resume_text, re.IGNORECASE):
        education_level = "Master's"
    elif re.search(r'\b(Bachelor|BS|B\.S\.|BA|B\.A\.)\b', resume_text, re.IGNORECASE):
        education_level = "Bachelor's"
    elif re.search(r'\b(Associate|AA|A\.A\.|AS|A\.S\.)\b', resume_text, re.IGNORECASE):
        education_level = "Associate's"
    
    # Try to determine job category
    category = "Software Engineering"
    if re.search(r'\b(Data Science|Machine Learning|AI|Artificial Intelligence|Data Analysis|Statistics)\b', resume_text, re.IGNORECASE):
        category = "Data Science"
    elif re.search(r'\b(Marketing|SEO|Social Media|Content|Brand|Advertising)\b', resume_text, re.IGNORECASE):
        category = "Marketing"
    elif re.search(r'\b(Finance|Accounting|Investment|Banking|Financial)\b', resume_text, re.IGNORECASE):
        category = "Finance"
    elif re.search(r'\b(Sales|Business Development|Account Manager|Client|Customer)\b', resume_text, re.IGNORECASE):
        category = "Sales"
    
    # Generate a generic summary
    summary = "This candidate appears to have experience in the " + category + " field. "
    summary += "They have demonstrated skills in " + ", ".join(skills[:3]) + ". "
    summary += "Their educational background includes a " + education_level + " degree. "
    summary += "They would be a good fit for roles requiring these skills and experience level."
    
    # Generate mock analysis result
    mock_result = {
        "summary": summary,
        "skills": skills,
        "experience": 3,  # Default to 3 years of experience
        "educationLevel": education_level,
        "category": category,
        "source": "mock_data"  # Add this to indicate it's mock data
    }

    logger.info("Generated mock analysis data")
    return mock_result


def get_openrouter_model_status(fallback_to_mock: bool = True) -> Dict[str, Any]:
    """
    Check if the OpenRouter API and model are available

    Args:
        fallback_to_mock: Whether to return a mock status if the API check fails

    Returns:
        Dict containing the status of the OpenRouter API and model
    """
    try:
        # Set up the headers with authentication - try a different approach
        # Remove 'Bearer ' prefix if it's already in the key
        api_key = OPENROUTER_API_KEY
        if api_key.startswith("Bearer "):
            api_key = api_key[7:]

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # Log the headers for debugging
        logger.info(f"Using Authorization header: Bearer {api_key[:10]}...{api_key[-5:]}")
        logger.info(f"Full API key being used: {api_key}")
        logger.info(f"Using Content-Type: {headers['Content-Type']}")
        logger.info(f"API key length: {len(api_key)} characters")

        # Use the models endpoint to check API status
        models_url = "https://openrouter.ai/api/v1/models"

        logger.info(f"Checking OpenRouter API status with URL: {models_url}")
        response = requests.get(models_url, headers=headers)

        if response.status_code == 200:
            # API is available, check if our model is available
            models_data = response.json()

            # Check if our model is in the list of available models
            model_available = False
            for model in models_data.get("data", []):
                if model.get("id") == OPENROUTER_MODEL:
                    model_available = True
                    break

            if model_available:
                return {
                    "status": "available",
                    "message": f"Ready for AI Analysis"
                }
            else:
                logger.warning(f"OpenRouter API is available but model {OPENROUTER_MODEL} was not found")
                return {
                    "status": "unavailable",
                    "message": f"OpenRouter API is available but model {OPENROUTER_MODEL} was not found",
                    "mode": "api"
                }
        elif response.status_code == 401 and fallback_to_mock:
            # Authentication failed, but we're falling back to mock data
            logger.warning("Authentication failed with OpenRouter API, falling back to mock status")
            return {
                "status": "available",
                "message": "Using fallback analysis (API key may have expired)",
                "using_fallback": True,
                "mode": "fallback"
            }
        else:
            logger.error(f"OpenRouter API check failed with status code {response.status_code}: {response.text}")
            if fallback_to_mock:
                return {
                    "status": "available",
                    "message": f"Using fallback analysis (API status code {response.status_code})",
                    "using_fallback": True,
                    "mode": "fallback"
                }
            else:
                return {
                    "status": "unavailable",
                    "message": f"OpenRouter API is unavailable (status code {response.status_code})",
                    "using_fallback": False,
                    "mode": "error"
                }
    except Exception as e:
        logger.error(f"Error checking OpenRouter API status: {e}")
        if fallback_to_mock:
            # Return a fallback status for the frontend
            logger.warning("Error checking OpenRouter API status, falling back to mock status")
            return {
                "status": "available",
                "message": "Using fallback analysis (API connection error)",
                "using_fallback": True,
                "mode": "fallback"
            }
        else:
            return {
                "status": "error",
                "message": f"Error checking OpenRouter API status: {str(e)}",
                "using_fallback": False,
                "mode": "error"
            }

async def get_relevance_score_with_openrouter(
    job_query: str,
    resume_text: str, # Use full resume text for better context
    fallback_to_mock: bool = True
) -> Dict[str, Any]:
    """
    Gets a relevance score for a resume against a job query using OpenRouter API.
    Returns a dictionary with 'score' (int) and 'reason' (str).
    """
    logger.info("Attempting to get relevance score using OpenRouter API")
    if not OPENROUTER_API_KEY:
        logger.warning("No OpenRouter API key found for scoring. Using mock score.")
        logger.info(f"OPENROUTER_API_KEY value at time of check: '{OPENROUTER_API_KEY}'")
        return generate_mock_score()

    try:
        client = httpx.AsyncClient(timeout=30.0) # Increased timeout for potentially longer LLM responses
        prompt_messages = [
            {"role": "system", "content": """You are an expert recruitment AI. Your task is to objectively assess the relevance of a candidate's resume to a specific job description. Provide a precise numerical score from 0 to 100 based on the match. Your score should reflect how well the candidate's skills, experience, and education align with the job requirements.

Be highly critical, precise, and use the full range of the 0-100 scale to clearly differentiate between excellent, good, average, and poor matches. Do not inflate scores. Provide a concise, specific reason for the score, highlighting concrete strengths and weaknesses relevant to the job.

Output only a JSON object with "score" (integer) and "reason" (string) keys."""},
            {"role": "user", "content": f"""
            Job Description: {job_query}
            
            Resume Text: {resume_text[:4000]}
            
            Based on the above, provide a relevance score (0-100) and a concise reason. Example: {{ "score": 85, "reason": "Strong alignment with required skills and experience in X, Y, Z." }}
            """}
        ]

        response = await client.post(
            OPENROUTER_CHAT_COMPLETIONS_API_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://github.com/theagentvikram/ResuMatch",
                "X-Title": "ResuMatch",
                "Content-Type": "application/json"
            },
            json={
                "model": OPENROUTER_MODEL_NAME,
                "messages": prompt_messages,
                "response_format": {"type": "json_object"},
                "max_tokens": 200 # Slightly increased max_tokens for more detailed reasons
            }
        )

        if response.status_code == 200:
            response_json = response.json()
            generated_text = response_json["choices"][0]["message"]["content"]
            
            try:
                parsed_result = json.loads(generated_text)
                score = parsed_result.get("score", 0)
                reason = parsed_result.get("reason", "No reason provided by LLM.")
                score = max(0, min(100, int(score))) # Ensure score is an int and within bounds
                return {"score": score, "reason": reason}
            except json.JSONDecodeError as json_err:
                logger.error(f"JSON parsing error for relevance score: {json_err}. Raw: {generated_text}")
                if fallback_to_mock:
                    return generate_mock_score()
                else:
                    raise ValueError(f"Failed to parse LLM score response: {json_err}")
        else:
            logger.error(f"OpenRouter API error for scoring ({response.status_code}): {response.text}")
            if fallback_to_mock:
                return generate_mock_score()
            else:
                raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")

    except Exception as e:
        logger.error(f"Error getting relevance score from OpenRouter: {str(e)}")
        if fallback_to_mock:
            return generate_mock_score()
        else:
            raise

def generate_mock_score() -> Dict[str, Any]:
    """
    Generates a mock score and reason.
    """
    return {"score": random.randint(50, 99), "reason": "Mock score: LLM API not available or failed."}
