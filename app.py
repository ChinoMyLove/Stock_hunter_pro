#!/usr/bin/env python3
"""
Stock Hunter Pro - Complete Flask Backend
🚀 Professional Stock Analysis System with Minervini Criteria
"""

import os
import sys
import logging
import traceback
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional
import time
import numpy as np
import pandas as pd

# Flask imports
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Add the utils directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'utils'))

# Import our custom modules
try:
    from utils.data_fetcher import DataFetcher
    from utils.minervini_criteria import MinerviniAnalyzer
    from utils.rs_calculator import RSRatingCalculator
    from utils.file_handler import FileHandler
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Please ensure all utils files are in place and requirements are installed.")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables
data_fetcher = None
minervini_analyzer = None
rs_calculator = None
file_handler = None
executor = None
MAX_WORKERS = 4

def initialize_components():
    """Initialize all analysis components"""
    global data_fetcher, minervini_analyzer, rs_calculator, file_handler, executor
    
    try:
        logger.info("🚀 Initializing Stock Hunter Pro components...")
        
        # Initialize components
        data_fetcher = DataFetcher()
        minervini_analyzer = MinerviniAnalyzer()
        rs_calculator = RSRatingCalculator()
        file_handler = FileHandler()
        executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)
        
        logger.info("✅ All components initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize components: {e}")
        logger.error(traceback.format_exc())
        return False

@app.route('/')
def index():
    """Serve the main interface"""
    return send_from_directory('.', 'index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'system_status': {
                'data_fetcher': data_fetcher is not None,
                'minervini_analyzer': minervini_analyzer is not None,
                'rs_calculator': rs_calculator is not None,
                'max_workers': MAX_WORKERS
            },
            'version': '2.0'
        })
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sample-data', methods=['GET'])
def get_sample_data():
    """Get sample stock data for testing"""
    try:
        sample_symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
            'CRM', 'ADBE', 'AMD', 'QCOM', 'AVGO', 'ORCL', 'UBER', 'DIS',
            'JPM', 'WMT'  # Replaced problematic symbols with stable ones
        ]
        
        return jsonify({
            'symbols': sample_symbols,
            'count': len(sample_symbols),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting sample data: {e}")
        return jsonify({'error': str(e)}), 500

def _clean_for_json(obj):
    """Recursively clean object for JSON serialization"""
    import numpy as np
    import pandas as pd
    
    if isinstance(obj, dict):
        return {key: _clean_for_json(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [_clean_for_json(item) for item in obj]
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, (np.integer, int)):
        return int(obj)
    elif isinstance(obj, (np.floating, float)):
        return float(obj)
    elif isinstance(obj, str):
        return str(obj)
    elif pd.isna(obj):
        return None
    else:
        return obj

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_stocks():
    """Analyze stocks using Minervini criteria"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        if not data or 'symbols' not in data:
            return jsonify({'error': 'No symbols provided'}), 400
        
        symbols = data['symbols']
        if not symbols:
            return jsonify({'error': 'Symbol list is empty'}), 400
            
        logger.info(f"🎯 Starting analysis for {len(symbols)} symbols")
        
        # Process stocks
        results = process_stocks_parallel(symbols)
        
        # Calculate statistics
        total_analyzed = len(results)
        passed_count = sum(1 for r in results if r.get('passed', False))
        success_rate = (passed_count / total_analyzed * 100) if total_analyzed > 0 else 0
        
        logger.info(f"📊 Analysis complete: {passed_count}/{total_analyzed} passed ({success_rate:.1f}%)")
        
        # Clean all data for JSON serialization
        response_data = _clean_for_json({
            'results': results,
            'summary': {
                'total_analyzed': total_analyzed,
                'passed_criteria': passed_count,
                'success_rate': round(success_rate, 1),
                'timestamp': datetime.now().isoformat()
            }
        })
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Analysis error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

def process_stocks_parallel(symbols: List[str]) -> List[Dict[str, Any]]:
    """Process multiple stocks in parallel"""
    results = []
    
    # Submit all tasks to thread pool
    future_to_symbol = {
        executor.submit(analyze_single_stock, symbol): symbol 
        for symbol in symbols
    }
    
    # Collect results as they complete
    for future in as_completed(future_to_symbol):
        symbol = future_to_symbol[future]
        try:
            result = future.result(timeout=60)  # 60 second timeout per stock
            results.append(result)
            
            # Log progress
            status = "✅" if result.get('passed', False) else "❌"
            rs_rating = result.get('rs_rating', 0)
            logger.info(f"{status} {symbol}: RS={rs_rating}, Status={status}")
            
        except Exception as e:
            logger.error(f"❌ Error processing {symbol}: {e}")
            results.append({
                'symbol': str(symbol),
                'passed': False,
                'error': str(e),
                'rs_rating': 0,
                'fail_reasons': [f'Data fetch failed: {str(e)}'],
                'metrics': {}
            })
    
    return results

def analyze_single_stock(symbol: str) -> Dict[str, Any]:
    """Analyze a single stock with all criteria"""
    try:
        # Fetch stock data
        stock_data = data_fetcher.fetch_stock_data(symbol)
        
        if not stock_data or 'error' in stock_data:
            error_msg = stock_data.get('error', 'Unknown data fetch error') if stock_data else 'No data returned'
            return {
                'symbol': str(symbol),
                'passed': False,
                'error': str(error_msg),
                'rs_rating': 0,
                'fail_reasons': [f'Data fetch failed: {error_msg}'],
                'metrics': {}
            }
        
        # Calculate RS Rating
        rs_rating = rs_calculator.calculate_rs_rating(stock_data)
        
        # Run Minervini analysis with RS rating
        analysis_result = minervini_analyzer.analyze_with_rs_rating(stock_data, rs_rating)
        
        # Structure the response to match frontend expectations
        # Convert all values to JSON-serializable types
        result = {
            'symbol': str(symbol),
            'passed': bool(analysis_result.get('passed', False)),
            'rs_rating': int(rs_rating),
            'fail_reasons': list(analysis_result.get('fail_reasons', [])),
            'score': int(analysis_result.get('score', 0)),
            'max_score': int(analysis_result.get('max_score', 7)),
            'metrics': {
                'price': float(stock_data.get('price', 0)),
                'ma50': float(stock_data.get('ma_50', 0)),
                'ma150': float(stock_data.get('ma_150', 0)),
                'ma200': float(stock_data.get('ma_200', 0)),
                'week_52_high': float(stock_data.get('week_52_high', 0)),
                'week_52_low': float(stock_data.get('week_52_low', 0)),
                'from_high_pct': float(stock_data.get('from_high_pct', 0)),
                'from_low_pct': float(stock_data.get('from_low_pct', 0)),
                'ma200_trending_up': bool(stock_data.get('ma_200_trending_up', False)),
                'volume': int(stock_data.get('volume', 0)),
                'volume_ratio': float(stock_data.get('volume_ratio', 1.0))
            },
            'details': _serialize_details(analysis_result.get('details', {})),
            'summary': str(analysis_result.get('summary', ''))
        }
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error analyzing {symbol}: {e}")
        return {
            'symbol': str(symbol),
            'passed': False,
            'error': str(e),
            'rs_rating': 0,
            'fail_reasons': [f'Analysis failed: {str(e)}'],
            'metrics': {},
            'score': 0,
            'max_score': 7
        }

def _serialize_details(details: Dict[str, Any]) -> Dict[str, Any]:
    """Convert analysis details to JSON-serializable format"""
    serialized = {}
    
    for key, value in details.items():
        if isinstance(value, dict):
            # Recursively serialize nested dictionaries
            serialized[key] = {}
            for sub_key, sub_value in value.items():
                if isinstance(sub_value, (bool, np.bool_)):
                    serialized[key][sub_key] = bool(sub_value)
                elif isinstance(sub_value, (int, np.integer)):
                    serialized[key][sub_key] = int(sub_value)
                elif isinstance(sub_value, (float, np.floating)):
                    serialized[key][sub_key] = float(sub_value)
                elif isinstance(sub_value, str):
                    serialized[key][sub_key] = str(sub_value)
                else:
                    serialized[key][sub_key] = sub_value
        else:
            # Convert top-level values
            if isinstance(value, (bool, np.bool_)):
                serialized[key] = bool(value)
            elif isinstance(value, (int, np.integer)):
                serialized[key] = int(value)
            elif isinstance(value, (float, np.floating)):
                serialized[key] = float(value)
            elif isinstance(value, str):
                serialized[key] = str(value)
            else:
                serialized[key] = value
    
    return serialized

@app.route('/api/stop-analysis', methods=['POST'])
def stop_analysis():
    """Stop ongoing analysis"""
    try:
        # In a real implementation, you'd cancel running tasks
        logger.info("⏹️ Analysis stop requested")
        return jsonify({'status': 'stopped'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

def main():
    """Main application entry point"""
    print("🚀 Starting Stock Hunter Pro v2.0...")
    
    # Initialize components
    if not initialize_components():
        print("❌ Failed to initialize components. Exiting.")
        sys.exit(1)
    
    print("✅ All systems initialized successfully!")
    print("📡 Server starting on http://localhost:5000")
    print("🎯 Ready for stock analysis!")
    
    # Start the Flask application
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=False,  # Set to True for development
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
        if executor:
            executor.shutdown(wait=True)
        print("✅ Shutdown complete!")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()