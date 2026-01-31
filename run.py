#!/usr/bin/env python
import os
import subprocess
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    print("Running Django migrations...")
    subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
    
    print("Seeding database...")
    subprocess.run([sys.executable, 'manage.py', 'seed'], check=False)
    
    print("Starting Django server on port 5000...")
    subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:5000'])

if __name__ == '__main__':
    main()
