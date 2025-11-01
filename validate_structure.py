#!/usr/bin/env python3
"""
Validation script to check if all required components are present
"""
import os
import sys

def validate_structure():
    """Validate that all required files and directories exist"""
    print("🔍 Validating Vector Indexing System Structure...")
    
    required_files = [
        "requirements.txt",
        ".env.example", 
        "README.md",
        "DOCUMENTATION.md",
        "Dockerfile",
        "docker-compose.yml",
        "setup.sh",
        "alembic.ini",
        "test_system.py",
        "example_usage.py"
    ]
    
    required_dirs = [
        "app",
        "app/core",
        "app/models", 
        "app/services",
        "app/api",
        "app/cli",
        "alembic",
        "alembic/versions"
    ]
    
    required_python_files = [
        "app/__init__.py",
        "app/core/__init__.py",
        "app/core/config.py",
        "app/core/database.py", 
        "app/core/logging.py",
        "app/models/__init__.py",
        "app/models/models.py",
        "app/services/__init__.py",
        "app/services/embedding_service.py",
        "app/services/text_chunking_service.py",
        "app/services/qdrant_service.py",
        "app/services/vector_indexing_service.py",
        "app/services/knowledge_service.py",
        "app/api/__init__.py",
        "app/api/knowledge.py",
        "app/main.py",
        "app/cli/__init__.py",
        "app/cli/main.py",
        "alembic/env.py",
        "alembic/script.py.mako",
        "alembic/versions/001_initial_migration.py"
    ]
    
    all_good = True
    
    # Check files
    print("\n📁 Checking required files...")
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"  ✅ {file_path}")
        else:
            print(f"  ❌ {file_path} - MISSING")
            all_good = False
    
    # Check directories
    print("\n📂 Checking required directories...")
    for dir_path in required_dirs:
        if os.path.isdir(dir_path):
            print(f"  ✅ {dir_path}")
        else:
            print(f"  ❌ {dir_path} - MISSING")
            all_good = False
    
    # Check Python files
    print("\n🐍 Checking required Python files...")
    for file_path in required_python_files:
        if os.path.exists(file_path):
            print(f"  ✅ {file_path}")
        else:
            print(f"  ❌ {file_path} - MISSING")
            all_good = False
    
    # Check file permissions
    print("\n🔐 Checking executable permissions...")
    executable_files = ["setup.sh", "example_usage.py"]
    for file_path in executable_files:
        if os.access(file_path, os.X_OK):
            print(f"  ✅ {file_path} - executable")
        else:
            print(f"  ⚠️  {file_path} - not executable (run chmod +x {file_path})")
    
    print("\n" + "="*50)
    if all_good:
        print("🎉 All required components are present!")
        print("\nNext steps:")
        print("1. Copy .env.example to .env and configure")
        print("2. Run: ./setup.sh")
        print("3. Start services: docker-compose up -d")
        print("4. Test: python test_system.py")
    else:
        print("❌ Some components are missing. Please check the list above.")
    
    return all_good

if __name__ == "__main__":
    success = validate_structure()
    sys.exit(0 if success else 1)