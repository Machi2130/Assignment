import os
import subprocess
import sys

def setup_project():
    # Install requirements
    #subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Run migrations
    #subprocess.run([sys.executable, "manage.py", "makemigrations"])
    subprocess.run([sys.executable, "manage.py", "migrate"])
    
    # Start Redis and Django server
    subprocess.Popen(["redis-server"])
    subprocess.run([sys.executable, "manage.py", "runserver"])

if __name__ == "__main__":
    setup_project()
