"""
Stock Hunter Pro - Utils Package
Professional stock analysis utilities
"""

# Import main classes
try:
    from .data_fetcher import DataFetcher
except ImportError as e:
    print(f"Warning: Could not import DataFetcher: {e}")
    DataFetcher = None

try:
    from .minervini_criteria import MinerviniAnalyzer
except ImportError as e:
    print(f"Warning: Could not import MinerviniAnalyzer: {e}")
    MinerviniAnalyzer = None

try:
    from .rs_calculator import RSRatingCalculator
except ImportError as e:
    print(f"Warning: Could not import RSRatingCalculator: {e}")
    RSRatingCalculator = None

try:
    from .file_handler import FileHandler
except ImportError as e:
    print(f"Warning: Could not import FileHandler: {e}")
    FileHandler = None

# Package version
__version__ = "2.0.0"

# Export main classes
__all__ = [
    'DataFetcher',
    'MinerviniAnalyzer', 
    'RSRatingCalculator',
    'FileHandler'
]