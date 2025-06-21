#!/usr/bin/env python3
"""
Stock Hunter Pro v2.0 - Connection Test Script
=============================================

Tests all system components to ensure proper functionality:
- Backend modules import
- Flask server startup
- API endpoints
- Data fetching capabilities
- Frontend-Backend communication

Run this script after installation to verify everything works.
"""

import sys
import os
import time
import threading
import requests
from datetime import datetime

def print_status(status, message):
    """Print colored status messages"""
    colors = {
        'success': '\033[92m✅',
        'error': '\033[91m❌', 
        'info': '\033[94m🔍',
        'warning': '\033[93m⚠️',
        'processing': '\033[96m📦'
    }
    reset = '\033[0m'
    
    if status in colors:
        print(f"{colors[status]} {message}{reset}")
    else:
        print(f"📦 {message}")

def test_python_version():
    """Test Python version compatibility"""
    print_status('info', "Testing Python version...")
    
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print_status('success', f"Python {version.major}.{version.minor}.{version.micro} - Compatible")
        return True
    else:
        print_status('error', f"Python {version.major}.{version.minor}.{version.micro} - Requires Python 3.8+")
        return False

def test_file_structure():
    """Test if all required files exist"""
    print_status('info', "Testing file structure...")
    
    required_files = [
        'app.py',
        'index.html', 
        'requirements.txt',
        'utils/__init__.py',
        'utils/data_fetcher.py',
        'utils/minervini_criteria.py',
        'utils/rs_calculator.py',
        'utils/file_handler.py',
        'data/sample_stocks.csv'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print_status('error', "Missing required files:")
        for file in missing_files:
            print(f"   • {file}")
        return False
    else:
        print_status('success', "All required files present")
        return True

def test_imports():
    """Test if all Python modules can be imported"""
    print_status('info', "Testing module imports...")
    
    try:
        # Test Flask
        import flask
        print_status('success', f"Flask {flask.__version__} imported")
        
        # Test data science libraries
        import pandas as pd
        import numpy as np
        import yfinance as yf
        print_status('success', f"Data libraries imported (pandas {pd.__version__}, numpy {np.__version__})")
        
        # Test our custom modules
        from utils.data_fetcher import DataFetcher
        from utils.minervini_criteria import MinerviniAnalyzer
        from utils.rs_calculator import RSCalculator
        from utils.file_handler import FileHandler
        
        print_status('success', "All custom modules imported successfully")
        return True
        
    except ImportError as e:
        print_status('error', f"Import error: {e}")
        print_status('warning', "Try running: pip install -r requirements.txt")
        return False

def test_data_fetcher():
    """Test data fetching capability"""
    print_status('info', "Testing data fetcher...")
    
    try:
        from utils.data_fetcher import DataFetcher
        
        # Test with a simple stock
        fetcher = DataFetcher()
        test_data = fetcher.fetch_stock_data(['AAPL'], period='5d')
        
        if not test_data.empty:
            print_status('success', f"Data fetcher working - Retrieved {len(test_data)} days of AAPL data")
            return True
        else:
            print_status('warning', "Data fetcher returned empty data - Check internet connection")
            return False
            
    except Exception as e:
        print_status('error', f"Data fetcher error: {e}")
        return False

def test_flask_server():
    """Test Flask server startup"""
    print_status('info', "Testing Flask server startup...")
    
    # Start server in background thread
    def run_server():
        try:
            from app import app
            app.run(host='127.0.0.1', port=5001, debug=False, use_reloader=False)
        except Exception as e:
            print_status('error', f"Server startup error: {e}")
    
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Wait for server to start
    time.sleep(3)
    
    # Test API endpoints
    try:
        # Test health endpoint
        response = requests.get('http://127.0.0.1:5001/api/health', timeout=5)
        if response.status_code == 200:
            print_status('success', "Flask server started and health endpoint responding")
            
            # Test sample data endpoint
            response = requests.get('http://127.0.0.1:5001/api/sample-data', timeout=5)
            if response.status_code == 200:
                sample_data = response.json()
                print_status('success', f"Sample data endpoint working - {len(sample_data.get('stocks', []))} sample stocks loaded")
                return True
            else:
                print_status('warning', "Sample data endpoint not responding properly")
                return False
        else:
            print_status('error', f"Health endpoint returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_status('error', f"Cannot connect to Flask server: {e}")
        return False

def test_analysis_pipeline():
    """Test the complete analysis pipeline"""
    print_status('info', "Testing analysis pipeline...")
    
    try:
        from utils.data_fetcher import DataFetcher
        from utils.minervini_criteria import MinerviniAnalyzer
        from utils.rs_calculator import RSCalculator
        
        # Test with a simple stock
        fetcher = DataFetcher()
        analyzer = MinerviniAnalyzer()
        rs_calc = RSCalculator()
        
        # Fetch test data
        stock_data = fetcher.fetch_stock_data(['AAPL'], period='1y')
        sp500_data = fetcher.fetch_sp500_data(period='1y')
        
        if stock_data.empty or sp500_data.empty:
            print_status('warning', "Cannot fetch data for pipeline test")
            return False
        
        # Test analysis
        result = analyzer.analyze_stock('AAPL', stock_data, sp500_data)
        
        if result and 'criteria_met' in result:
            print_status('success', f"Analysis pipeline working - AAPL analysis completed")
            print_status('info', f"   AAPL passed {result['criteria_met']}/7 criteria")
            return True
        else:
            print_status('error', "Analysis pipeline returned invalid results")
            return False
            
    except Exception as e:
        print_status('error', f"Analysis pipeline error: {e}")
        return False

def run_comprehensive_test():
    """Run all tests and provide summary"""
    print("=" * 70)
    print("🧪 Stock Hunter Pro v2.0 - Comprehensive System Test")
    print("=" * 70)
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Python Version", test_python_version),
        ("File Structure", test_file_structure), 
        ("Module Imports", test_imports),
        ("Data Fetcher", test_data_fetcher),
        ("Flask Server", test_flask_server),
        ("Analysis Pipeline", test_analysis_pipeline)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n🔬 Running: {test_name}")
        print("-" * 50)
        
        try:
            result = test_func()
            results[test_name] = result
        except Exception as e:
            print_status('error', f"Test failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = 'success' if result else 'error'
        print_status(status, f"{test_name}: {'PASSED' if result else 'FAILED'}")
    
    print(f"\n🎯 Overall Score: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print_status('success', "🎉 All tests passed! Stock Hunter Pro is ready to use!")
        print("\n💡 Next steps:")
        print("   1. Run: python app.py (or use start.bat/start.sh)")
        print("   2. Open: http://localhost:5000")
        print("   3. Import CSV or load sample data")
        print("   4. Start analyzing stocks!")
    else:
        print_status('warning', f"⚠️  {total-passed} test(s) failed. Please fix issues before using.")
        print("\n🛠️  Troubleshooting:")
        print("   1. Check Python version (requires 3.8+)")
        print("   2. Install dependencies: pip install -r requirements.txt")
        print("   3. Verify internet connection for data fetching")
        print("   4. Check file permissions")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = run_comprehensive_test()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_status('warning', "\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_status('error', f"\n❌ Unexpected error: {e}")
        sys.exit(1)