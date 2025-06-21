#!/usr/bin/env python3
"""
Stock Hunter Pro - Quick Start Script
Simple launcher for the Stock Hunter Pro application
"""

import os
import sys
import webbrowser
import time
import subprocess
from pathlib import Path

def print_banner():
    """Print application banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║        📈 Stock Hunter Pro - Professional Analysis          ║
    ║                                                              ║
    ║           🎯 Minervini Trend Template Analysis               ║
    ║           📊 Accurate RS Rating Calculations                 ║
    ║           ⭐ Smart Watch List Management                     ║
    ║           🚀 Premium Financial Interface                     ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_setup():
    """Check if setup is complete"""
    print("🔍 Checking system setup...")
    
    required_files = [
        "app.py",
        "requirements.txt", 
        "utils/__init__.py",
        "data/sample_stocks.csv"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing required files:")
        for file_path in missing_files:
            print(f"   • {file_path}")
        print("\n💡 Please run setup first: python setup.py")
        return False
    
    # Check if dependencies are installed
    try:
        import flask
        import yfinance
        import pandas
        print("✅ Dependencies check passed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("💡 Please install: pip install -r requirements.txt")
        return False
    
    print("✅ System setup verified")
    return True

def start_application():
    """Start the Flask application"""
    print("🚀 Starting Stock Hunter Pro...")
    print("   Backend: Flask server")
    print("   Frontend: Premium HTML interface")
    print("   Port: 5000")
    print()
    
    try:
        # Import and run the app
        from app import app
        
        print("🌐 Application starting...")
        print("   URL: http://localhost:5000")
        print("   Press Ctrl+C to stop")
        print()
        
        # Auto-open browser after a delay
        def open_browser():
            time.sleep(2)
            try:
                webbrowser.open('http://localhost:5000')
                print("🔗 Browser opened automatically")
            except:
                print("💡 Manual browser open: http://localhost:5000")
        
        import threading
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        # Start Flask app
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=False,  # Set to False for clean output
            threaded=True,
            use_reloader=False  # Disable reloader for cleaner startup
        )
        
    except KeyboardInterrupt:
        print("\n\n👋 Stock Hunter Pro stopped by user")
        print("   Thank you for using Stock Hunter Pro!")
        
    except Exception as e:
        print(f"\n❌ Error starting application: {e}")
        print("💡 Try running directly: python app.py")
        return False
    
    return True

def show_quick_help():
    """Show quick usage help"""
    help_text = """
    📚 Quick Start Guide:
    
    1. 📁 Load Data:
       • Click "Load Sample" for 16 test stocks
       • Upload CSV file with stock symbols  
       • Enter symbols manually (e.g., AAPL,MSFT,GOOGL)
    
    2. 🎯 Run Analysis:
       • Click "Run Analysis" button
       • Wait for processing (30-60 seconds)
       • Review results in the table
    
    3. ⭐ Manage Watch List:
       • Click star icons to add stocks
       • View Watch List tab for tracking
       • Export results as CSV
    
    🔧 Features:
    • Minervini 8-Point Trend Template
    • RS Rating vs S&P 500 (1-99 scale)
    • Real-time market data from Yahoo Finance
    • Professional dark theme interface
    • Batch processing for large datasets
    
    💡 Tips:
    • Best results with 10-100 stocks
    • Analysis works during market hours
    • High RS Rating (≥70) preferred
    • Watch for ✅ status stocks
    
    """
    print(help_text)

def main():
    """Main function"""
    print_banner()
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        
        if arg in ['--help', '-h', 'help']:
            show_quick_help()
            return
        
        elif arg in ['--setup', '-s', 'setup']:
            print("🔧 Running setup...")
            os.system("python setup.py")
            return
        
        elif arg in ['--check', '-c', 'check']:
            check_setup()
            return
    
    # Normal startup flow
    if not check_setup():
        print("\n💡 Run setup first: python run.py --setup")
        return
    
    print()
    start_application()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        print("💡 Try: python app.py for direct startup")