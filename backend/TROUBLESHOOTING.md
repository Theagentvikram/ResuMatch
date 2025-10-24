# Backend Troubleshooting Guide

## Recent Fixes Applied

### 1. **Enhanced OpenRouter API Response Handling**

#### Issues Fixed:
- **Empty API Responses**: Added detection for when OpenRouter returns empty content
- **Better Error Logging**: Now logs full API response structure for debugging
- **Graceful Fallbacks**: Automatically falls back to mock/regex analysis when API fails
- **Null Safety**: Added null checks for content extraction

#### Changes Made to `openrouter_service.py`:
- Added JSON response parsing error handling
- Added detailed logging of API response structure
- Added checks for empty `content` in API responses
- Added better handling when `choices` array is missing or empty
- Improved fallback mechanism to use mock data when API fails

### 2. **Root Cause Analysis**

Based on the logs, the issue was:
```
INFO: Response status code: 200
ERROR: JSON parsing error: Expecting value: line 1 column 2 (char 1)
ERROR: Problematic JSON:  (empty)
```

**This means:**
- API authentication is successful (200 status)
- OpenRouter accepted the request
- BUT the model returned an empty response

**Possible Reasons:**
1. **Free tier rate limiting** - The free `mistralai/mistral-7b-instruct:free` model may have rate limits
2. **Model availability** - The free model might be overloaded
3. **Prompt length** - Prompts are truncated to 6000 chars, but might still be too long
4. **API quota** - Your API key might have reached its free tier limit

## How to Diagnose the Issue

### Step 1: Check the Detailed Logs

After the fixes, when you upload a resume, you'll now see these new log messages:

```
INFO: Response structure: ['id', 'choices', 'created', 'model']
INFO: Full API response: {...}
INFO: First choice structure: ['index', 'message', 'finish_reason']
INFO: Extracted content length: 0 chars
ERROR: OpenRouter API returned empty content
```

### Step 2: Verify Your API Key

```bash
# Check if API key is properly set
cd /Users/abhi/Downloads/Resu/ResuMatch/backend
source venv/bin/activate
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()
key = os.getenv('OPENROUTER_API_KEY', '')
print(f'API Key length: {len(key)}')
print(f'API Key starts with: {key[:10]}...' if key else 'No API key found')
"
```

### Step 3: Test OpenRouter API Directly

```bash
# Test your API key directly with OpenRouter
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "HTTP-Referer: https://resumatcher.netlify.app" \
  -H "X-Title: ResuMatch" \
  -d '{
    "model": "mistralai/mistral-7b-instruct:free",
    "messages": [
      {"role": "user", "content": "Say hello"}
    ]
  }'
```

### Step 4: Check OpenRouter Status

Visit: https://openrouter.ai/models/mistralai/mistral-7b-instruct:free

Check if the model is:
- ✅ Available
- ✅ Not overloaded
- ✅ Shows current pricing/limits

## Solutions

### Solution 1: Use a Different Model (Recommended)

OpenRouter has other free models that might work better:

Edit `/Users/abhi/Downloads/Resu/ResuMatch/backend/.env`:

```env
# Try these alternative free models:
OPENROUTER_MODEL=google/gemma-2-9b-it:free
# OR
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct:free
# OR
OPENROUTER_MODEL=openchat/openchat-7b:free
```

### Solution 2: Use Paid Model (Better Quality)

For production use, consider a paid model for better reliability:

```env
# Best quality (paid)
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
# OR
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Check pricing at: https://openrouter.ai/models

### Solution 3: Use Regex Fallback (Already Working)

The application already works with regex-based analysis:

```env
# Force regex mode (no API calls)
ANALYZER_MODE=regex
```

Or simply remove/empty the API key:
```env
OPENROUTER_API_KEY=
```

The regex analyzer works well and extracts:
- Skills using pattern matching
- Experience from work history
- Education level
- Job category
- Professional summary

## Current Status

✅ **Backend is running successfully**
✅ **Error handling improved**
✅ **Fallback mechanism working**
✅ **Detailed logging enabled**

### What Works Now:

1. **Resume Upload**: ✅ Working
2. **PDF Text Extraction**: ✅ Working (PyMuPDF)
3. **Resume Storage**: ✅ Working (2 resumes loaded)
4. **Job Postings**: ✅ Working (9 jobs loaded)
5. **Regex Analysis**: ✅ Working (automatic fallback)
6. **API Error Handling**: ✅ Improved

### What to Check:

1. **OpenRouter API** - May need different model or paid tier
2. **API Quotas** - Check if you've hit free tier limits
3. **Model Availability** - Free models can be overloaded

## Testing the Fixes

### Test 1: Upload a Resume

```bash
# Test resume analysis
cd /Users/abhi/Downloads/Resu/ResuMatch/backend
curl -X POST http://localhost:8000/api/resumes/analyze \
  -F "file=@storage/resumes/$(ls storage/resumes | head -1)"
```

Watch the server logs for the new detailed output.

### Test 2: Check Model Status

```bash
curl http://localhost:8000/api/model/status | python3 -m json.tool
```

Expected output with OpenRouter:
```json
{
  "status": "available",
  "message": "Ready for AI Analysis",
  "using_fallback": false,
  "mode": "api"
}
```

Or with regex fallback:
```json
{
  "status": "available",
  "message": "Using regex-based analysis",
  "using_fallback": true,
  "mode": "regex"
}
```

## Next Steps

1. **Check the detailed logs** in the terminal where uvicorn is running
2. **Look for the new log messages** showing API response structure
3. **Try a different OpenRouter model** if the current one returns empty
4. **Consider the regex fallback** - it's working well and doesn't need API
5. **For production**, use a paid API model for better reliability

## Getting Help

If issues persist, collect these logs:
1. Full server output when uploading a resume
2. The "Full API response" log message
3. The "Extracted content length" log message
4. Your OpenRouter account status

Then check:
- OpenRouter dashboard: https://openrouter.ai/keys
- OpenRouter docs: https://openrouter.ai/docs
- Model status: https://openrouter.ai/models


