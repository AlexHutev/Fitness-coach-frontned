import subprocess
import os
import sys

# Change to the frontend directory
frontend_dir = 'C:/university/fitness-coach-fe'
os.chdir(frontend_dir)

print(f"Starting frontend from: {os.getcwd()}")

# Start the Next.js dev server
try:
    result = subprocess.run(['npm', 'run', 'dev'], cwd=frontend_dir)
except Exception as e:
    print(f"Error starting frontend: {e}")
