#!/usr/bin/env python3
"""
Test script to verify RunAI setup
Run this to check if everything is configured correctly
"""

import sys
import os

def test_imports():
    """Test that all required modules can be imported"""
    print("🔍 Testing imports...")

    try:
        import fastapi
        print("  ✅ FastAPI installed")
    except ImportError:
        print("  ❌ FastAPI not installed - run: pip install -r requirements.txt")
        return False

    try:
        import ollama
        print("  ✅ Ollama package installed")
    except ImportError:
        print("  ❌ Ollama package not installed - run: pip install ollama")
        return False

    try:
        import sqlalchemy
        print("  ✅ SQLAlchemy installed")
    except ImportError:
        print("  ❌ SQLAlchemy not installed - run: pip install sqlalchemy")
        return False

    return True

def test_database():
    """Test database connection"""
    print("\n🔍 Testing database...")

    try:
        from app.core.database import engine, Base
        from app.models import User, Goal, TrainingPlan, Workout, Route

        # Try to create tables
        Base.metadata.create_all(bind=engine)

        print(f"  ✅ Database connection successful")
        print(f"  📁 Database location: {engine.url}")

        # List tables
        tables = Base.metadata.tables.keys()
        print(f"  📊 Tables created: {len(tables)}")
        for table in tables:
            print(f"     - {table}")

        return True

    except Exception as e:
        print(f"  ❌ Database error: {e}")
        return False

def test_ollama():
    """Test Ollama connection"""
    print("\n🔍 Testing Ollama (AI)...")

    try:
        import ollama

        # Try to list models
        models = ollama.list()

        if models and 'models' in models:
            print(f"  ✅ Ollama is running")
            print(f"  🤖 Available models: {len(models['models'])}")
            for model in models['models']:
                print(f"     - {model['name']}")

            # Check for llama3.2:3b
            model_names = [m['name'] for m in models['models']]
            if any('llama3.2' in name and '3b' in name for name in model_names):
                print("  ✅ Recommended model (llama3.2:3b) is installed")
            else:
                print("  ⚠️  Recommended model not found. Run: ollama pull llama3.2:3b")

            return True
        else:
            print("  ❌ Ollama is installed but not responding")
            print("     Make sure Ollama is running")
            return False

    except Exception as e:
        print(f"  ❌ Ollama error: {e}")
        print("     Install Ollama from: https://ollama.ai/download")
        return False

def test_config():
    """Test configuration"""
    print("\n🔍 Testing configuration...")

    try:
        from app.core.config import settings

        print(f"  ✅ Configuration loaded")
        print(f"  📌 Project: {settings.PROJECT_NAME}")
        print(f"  📌 Version: {settings.VERSION}")
        print(f"  📌 Database: {settings.DATABASE_URL}")
        print(f"  📌 Ollama URL: {settings.OLLAMA_BASE_URL}")
        print(f"  📌 Ollama Model: {settings.OLLAMA_MODEL}")

        return True

    except Exception as e:
        print(f"  ❌ Configuration error: {e}")
        return False

def main():
    """Run all tests"""
    print("="*60)
    print("RunAI Setup Test")
    print("="*60)

    tests = [
        ("Imports", test_imports),
        ("Configuration", test_config),
        ("Database", test_database),
        ("Ollama AI", test_ollama),
    ]

    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ {name} test crashed: {e}")
            results.append((name, False))

    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")

    print("\n" + "="*60)
    if passed == total:
        print("🎉 All tests passed! RunAI is ready to use.")
        print("\nNext steps:")
        print("  1. Start the backend: uvicorn app.main:app --reload")
        print("  2. Start the frontend: cd ../frontend && npm run dev")
        print("  3. Open http://localhost:5173")
    else:
        print(f"⚠️  {total - passed} test(s) failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("  - Install dependencies: pip install -r requirements.txt")
        print("  - Install Ollama: https://ollama.ai/download")
        print("  - Download model: ollama pull llama3.2:3b")
    print("="*60)

    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
