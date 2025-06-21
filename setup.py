#!/usr/bin/env python3
"""
Stock Hunter Pro - Setup & Installation Script
Automated setup for the professional stock analysis platform
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def print_header():
    """Print welcome header"""
    print("=" * 60)
    print("📈 Stock Hunter Pro - Setup & Installation")
    print("Professional Stock Analysis Platform")
    print("=" * 60)
    print()

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher required")
        print(f"   Current version: {sys.version}")
        print("   Please upgrade Python and try again")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True

def create_directories():
    """Create necessary directories"""
    print("📁 Creating project directories...")
    
    directories = [
        "data",
        "data/results", 
        "logs",
        "utils"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"   ✅ {directory}/")
    
    return True

def install_requirements():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    
    try:
        # Upgrade pip first
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        
        # Install requirements
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        
        print("✅ All dependencies installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        print("   Please try manually: pip install -r requirements.txt")
        return False

def create_env_file():
    """Create .env file from template"""
    print("⚙️ Setting up environment configuration...")
    
    if not os.path.exists(".env"):
        if os.path.exists(".env.example"):
            with open(".env.example", "r") as src:
                content = src.read()
            
            with open(".env", "w") as dst:
                dst.write(content)
            
            print("✅ Created .env file from template")
            print("   📝 You can customize settings in .env file")
        else:
            # Create basic .env
            basic_env = """# Stock Hunter Pro Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000
LOG_LEVEL=INFO
"""
            with open(".env", "w") as f:
                f.write(basic_env)
            
            print("✅ Created basic .env file")
    else:
        print("✅ .env file already exists")
    
    return True

def create_sample_data():
    """Create sample data files"""
    print("📊 Setting up sample data...")
    
    # Create sample watchlist if doesn't exist
    watchlist_file = "data/watchlist_history.json"
    if not os.path.exists(watchlist_file):
        sample_watchlist = {
            "watchlist": [],
            "history": [],
            "created": "2025-06-20T00:00:00.000Z",
            "last_updated": "2025-06-20T00:00:00.000Z",
            "version": "1.0.0",
            "settings": {
                "min_rs_rating": 70,
                "auto_add_threshold": 7,
                "max_watchlist_size": 50
            }
        }
        
        with open(watchlist_file, "w") as f:
            json.dump(sample_watchlist, f, indent=2)
        
        print("✅ Created sample watchlist file")
    
    return True

def test_installation():
    """Test if installation works"""
    print("🧪 Testing installation...")
    
    try:
        # Test imports
        print("   Testing Python imports...")
        import flask
        import yfinance
        import pandas
        import numpy
        print("   ✅ Core dependencies imported successfully")
        
        # Test utils imports
        print("   Testing utils modules...")
        sys.path.insert(0, '.')
        from utils import DataFetcher, MinerviniAnalyzer, RSRatingCalculator, FileHandler
        print("   ✅ Utils modules imported successfully")
        
        print("✅ Installation test passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Please check your installation")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def print_next_steps():
    """Print next steps for user"""
    print()
    print("🎉 Setup Complete!")
    print("=" * 40)
    print()
    print("Next Steps:")
    print("1. Start the application:")
    print("   python app.py")
    print()
    print("2. Open your browser:")
    print("   http://localhost:5000")
    print()
    print("3. Load sample data or upload your CSV:")
    print("   • Click 'Load Sample' for quick testing")
    print("   • Upload CSV with stock symbols")
    print("   • Enter symbols manually")
    print()
    print("4. Run analysis:")
    print("   • Click 'Run Analysis' button")
    print("   • Review results table")
    print("   • Add stars for watchlist")
    print()
    print("📚 Documentation:")
    print("   • README.md - Complete user guide")
    print("   • stock_hunter_pro_documentation.md - Technical details")
    print()
    print("🆘 Need Help?")
    print("   • Check logs/ directory for error logs")
    print("   • Verify .env configuration")
    print("   • Ensure internet connection for market data")
    print()
    print("Happy Stock Hunting! 📈")

def main():
    """Main setup function"""
    print_header()
    
    # Check system requirements
    if not check_python_version():
        sys.exit(1)
    
    print()
    
    # Setup steps
    steps = [
        ("Creating directories", create_directories),
        ("Installing dependencies", install_requirements),
        ("Setting up configuration", create_env_file),
        ("Creating sample data", create_sample_data),
        ("Testing installation", test_installation)
    ]
    
    for step_name, step_func in steps:
        try:
            if not step_func():
                print(f"❌ Failed: {step_name}")
                sys.exit(1)
        except Exception as e:
            print(f"❌ Error in {step_name}: {e}")
            sys.exit(1)
        
        print()
    
    print_next_steps()

if __name__ == "__main__":
    main()