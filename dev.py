#!/usr/bin/env python
import os
import subprocess
import sys
import signal
import time

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    print("Running Django migrations...")
    subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
    
    print("Seeding database...")
    subprocess.run([sys.executable, 'manage.py', 'seed'], check=False)
    
    print("Starting Django API server on port 8000...")
    django_proc = subprocess.Popen([
        sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'
    ])
    
    time.sleep(3)
    print("Django is ready. Express+Vite should be proxying /api to Django.")
    
    try:
        django_proc.wait()
    except KeyboardInterrupt:
        django_proc.terminate()
        sys.exit(0)

if __name__ == '__main__':
    main()
