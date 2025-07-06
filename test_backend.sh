#!/bin/bash
echo "Testing ResuMatch backend with persistent storage..."

# Set environment variables for testing
export ENABLE_SAMPLE_DATA=false
export ANALYZER_MODE=api

# Test if the backend starts without errors
cd /Users/abhi/Documents/Projects/TestProjects/Resu-Test/backend
python -c "
import sys
sys.path.append('.')
try:
    from main import app
    print('✅ Backend imported successfully')
    print('✅ FastAPI app created')
    
    # Test persistent storage
    from services.persistent_storage import storage
    print(f'✅ Storage type: {getattr(storage, \"storage_type\", \"unknown\")}')
    
    # Test basic operations
    resumes = storage.load_resumes()
    print(f'✅ Loaded {len(resumes)} resumes from storage')
    
    print('✅ All tests passed!')
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
"

echo "Backend test completed."
