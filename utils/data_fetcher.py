import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Dict, Optional, Any
import warnings
import time

# Suppress warnings
warnings.filterwarnings('ignore')

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataFetcher:
    """
    Enhanced data fetcher that works with Yahoo Finance latest updates
    🔥 FIXED: No more curl_cffi session errors!
    """
    
    def __init__(self):
        self.session = None  # Don't set custom session, let yfinance handle it
        
        # Symbol mapping for problematic tickers
        self.symbol_mapping = {
            'BRK.A': 'BRK-A',
            'BRK.B': 'BRK-B',
            'BF.B': 'BF-B',
            'SQ': 'BLOCK'  # Square changed to Block
        }
    
    def _clean_symbol(self, symbol: str) -> str:
        """Clean and standardize symbol for Yahoo Finance"""
        # Use mapping if available
        if symbol in self.symbol_mapping:
            return self.symbol_mapping[symbol]
        return symbol
        
    def fetch_stock_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Fetch comprehensive stock data for analysis
        ✅ Compatible with Yahoo Finance 2025 updates
        """
        try:
            logger.info(f"📡 Fetching data for {symbol}")
            
            # Handle special symbols
            clean_symbol = self._clean_symbol(symbol)
            
            # Create ticker without custom session
            ticker = yf.Ticker(clean_symbol)
            
            # Get historical data (1 year of data for analysis)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=400)  # More data for better calculations
            
            # Fetch data with error handling and retries
            hist = None
            max_retries = 3
            
            for attempt in range(max_retries):
                try:
                    hist = ticker.history(
                        start=start_date,
                        end=end_date,
                        interval="1d",
                        auto_adjust=True,
                        prepost=False,
                        repair=True,
                        timeout=30
                    )
                    
                    if not hist.empty:
                        break
                    
                    if attempt < max_retries - 1:
                        logger.warning(f"⚠️ Attempt {attempt + 1} failed for {symbol}, retrying...")
                        time.sleep(1)
                        
                except Exception as e:
                    if attempt < max_retries - 1:
                        logger.warning(f"⚠️ Attempt {attempt + 1} failed for {symbol}: {e}")
                        time.sleep(1)
                    else:
                        raise e
            
            if hist is None or hist.empty:
                logger.warning(f"⚠️ No historical data for {symbol} after {max_retries} attempts")
                return None
                
            # Get additional info (with error handling)
            info = {}
            try:
                info = ticker.info or {}
            except Exception as e:
                logger.warning(f"⚠️ Could not fetch info for {symbol}: {e}")
                info = {}
            
            # Calculate technical indicators
            data = self._calculate_indicators(hist, symbol)
            
            # Add company info
            data.update({
                'company_name': info.get('longName', symbol),
                'sector': info.get('sector', 'Unknown'),
                'market_cap': info.get('marketCap', 0),
                'raw_info': info
            })
            
            logger.info(f"✅ {symbol}: Successfully fetched {len(hist)} days of data")
            return data
            
        except Exception as e:
            logger.error(f"❌ Error fetching {symbol}: {str(e)}")
            return None
    
    def _calculate_indicators(self, hist: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Calculate all technical indicators needed for Minervini analysis"""
        try:
            # Ensure we have enough data
            if len(hist) < 50:
                logger.warning(f"⚠️ Insufficient data for {symbol}: only {len(hist)} days")
                return {'symbol': symbol, 'error': 'Insufficient data'}
            
            # Basic price data
            current_price = float(hist['Close'].iloc[-1])
            
            # Moving averages with error handling
            try:
                hist['MA_50'] = hist['Close'].rolling(window=50, min_periods=25).mean()
                hist['MA_150'] = hist['Close'].rolling(window=150, min_periods=75).mean()
                hist['MA_200'] = hist['Close'].rolling(window=200, min_periods=100).mean()
            except Exception as e:
                logger.warning(f"⚠️ Error calculating MAs for {symbol}: {e}")
                # Fallback to simple calculations
                hist['MA_50'] = hist['Close'].rolling(window=min(50, len(hist)//2)).mean()
                hist['MA_150'] = hist['Close'].rolling(window=min(150, len(hist)//2)).mean()
                hist['MA_200'] = hist['Close'].rolling(window=min(200, len(hist)//2)).mean()
            
            # 52-week high/low (or available data)
            lookback_days = min(252, len(hist))
            week_52_high = float(hist['High'].tail(lookback_days).max())
            week_52_low = float(hist['Low'].tail(lookback_days).min())
            
            # Current MA values with fallback
            ma_50 = float(hist['MA_50'].iloc[-1]) if not pd.isna(hist['MA_50'].iloc[-1]) else current_price
            ma_150 = float(hist['MA_150'].iloc[-1]) if not pd.isna(hist['MA_150'].iloc[-1]) else current_price  
            ma_200 = float(hist['MA_200'].iloc[-1]) if not pd.isna(hist['MA_200'].iloc[-1]) else current_price
            
            # Check if MAs are trending up (compare recent vs older values)
            ma_50_trending = self._is_trending_up(hist['MA_50'])
            ma_150_trending = self._is_trending_up(hist['MA_150']) 
            ma_200_trending = self._is_trending_up(hist['MA_200'])
            
            # Distance from highs/lows
            from_high_pct = round(((current_price - week_52_high) / week_52_high) * 100, 1)
            from_low_pct = round(((current_price - week_52_low) / week_52_low) * 100, 1)
            
            # Volume analysis with error handling
            try:
                avg_volume = int(hist['Volume'].tail(50).mean())
                recent_volume = int(hist['Volume'].iloc[-1])
                volume_ratio = recent_volume / avg_volume if avg_volume > 0 else 1
            except Exception as e:
                logger.warning(f"⚠️ Error calculating volume for {symbol}: {e}")
                avg_volume = 1000000
                recent_volume = 1000000
                volume_ratio = 1.0
            
            # Price relative to MAs
            price_vs_ma_50 = round(((current_price - ma_50) / ma_50) * 100, 1) if ma_50 > 0 else 0
            price_vs_ma_150 = round(((current_price - ma_150) / ma_150) * 100, 1) if ma_150 > 0 else 0
            price_vs_ma_200 = round(((current_price - ma_200) / ma_200) * 100, 1) if ma_200 > 0 else 0
            
            return {
                'symbol': symbol,
                'price': round(current_price, 2),
                'ma_50': round(ma_50, 2),
                'ma_150': round(ma_150, 2),
                'ma_200': round(ma_200, 2),
                'week_52_high': round(week_52_high, 2),
                'week_52_low': round(week_52_low, 2),
                'from_high_pct': from_high_pct,
                'from_low_pct': from_low_pct,
                'ma_50_trending_up': ma_50_trending,
                'ma_150_trending_up': ma_150_trending,
                'ma_200_trending_up': ma_200_trending,
                'price_vs_ma_50': price_vs_ma_50,
                'price_vs_ma_150': price_vs_ma_150,
                'price_vs_ma_200': price_vs_ma_200,
                'volume': recent_volume,
                'avg_volume': avg_volume,
                'volume_ratio': round(volume_ratio, 2),
                'historical_data': hist
            }
            
        except Exception as e:
            logger.error(f"❌ Error calculating indicators for {symbol}: {e}")
            return {'symbol': symbol, 'error': str(e)}
    
    def _is_trending_up(self, ma_series: pd.Series, lookback: int = 20) -> bool:
        """Check if moving average is trending upward"""
        try:
            if len(ma_series) < lookback + 1:
                return False
                
            recent = ma_series.iloc[-1]
            older = ma_series.iloc[-(lookback + 1)]
            
            if pd.isna(recent) or pd.isna(older):
                return False
                
            return recent > older
            
        except Exception:
            return False
    
    def fetch_multiple_stocks(self, symbols: list) -> Dict[str, Any]:
        """
        Fetch data for multiple stocks efficiently
        🚀 Optimized for batch processing
        """
        results = {}
        
        logger.info(f"🎯 Starting batch fetch for {len(symbols)} symbols")
        
        for i, symbol in enumerate(symbols, 1):
            try:
                logger.info(f"📊 Processing {symbol} ({i}/{len(symbols)})")
                data = self.fetch_stock_data(symbol)
                
                if data:
                    results[symbol] = data
                    logger.info(f"✅ {symbol}: Success")
                else:
                    results[symbol] = {'symbol': symbol, 'error': 'No data available'}
                    logger.warning(f"⚠️ {symbol}: No data")
                    
            except Exception as e:
                logger.error(f"❌ {symbol}: Failed - {e}")
                results[symbol] = {'symbol': symbol, 'error': str(e)}
        
        logger.info(f"🎯 Batch complete: {len(results)} symbols processed")
        return results


# 🔥 USAGE EXAMPLE:
def test_data_fetcher():
    """Test the fixed data fetcher"""
    fetcher = DataFetcher()
    
    # Test single stock
    print("🧪 Testing single stock fetch...")
    data = fetcher.fetch_stock_data("AAPL")
    if data and 'error' not in data:
        print(f"✅ AAPL: ${data['price']} | MA200: ${data['ma_200']}")
    else:
        print(f"❌ AAPL: Failed")
    
    # Test multiple stocks
    print("\n🧪 Testing batch fetch...")
    symbols = ['AAPL', 'MSFT', 'GOOGL', 'BLOCK']  # Use BLOCK instead of SQ
    results = fetcher.fetch_multiple_stocks(symbols)
    
    for symbol, data in results.items():
        if 'error' not in data:
            print(f"✅ {symbol}: ${data['price']}")
        else:
            print(f"❌ {symbol}: {data['error']}")


if __name__ == "__main__":
    test_data_fetcher()