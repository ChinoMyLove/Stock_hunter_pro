"""
Stock Hunter Pro - RS Rating Calculator Module
Accurate implementation of Relative Strength Rating calculation
Based on IBD's methodology comparing stock performance vs S&P 500
"""

import pandas as pd
import numpy as np
import logging
import yfinance as yf
from typing import Dict, Optional, Tuple, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class RSRatingCalculator:
    """
    RS Rating Calculator implementing IBD's methodology
    
    4 time periods for comparison vs S&P 500:
    - 63 days (quarter)
    - 126 days (half year) 
    - 189 days (3 quarters)
    - 252 days (year)
    
    Formula weights recent performance more heavily:
    - Most recent quarter: 40%
    - Prior quarters: 20% each
    """
    
    def __init__(self):
        self.periods = [63, 126, 189, 252]  # Trading days
        self.weights = [0.4, 0.2, 0.2, 0.2]  # Most recent weighted higher
        self.sp500_cache = None
        self.cache_timestamp = None
        logger.info("📊 RS Rating Calculator initialized with IBD methodology")
    
    def calculate_rs_rating(self, stock_data: Dict[str, Any]) -> int:
        """
        Calculate RS Rating for a stock
        
        Args:
            stock_data: Stock data from DataFetcher
            
        Returns:
            RS Rating (1-99, higher is better)
        """
        try:
            symbol = stock_data.get('symbol', 'Unknown')
            
            # Get stock historical data
            hist_data = stock_data.get('historical_data')
            if hist_data is None or hist_data.empty:
                logger.warning(f"❌ No historical data for {symbol}")
                return 1
            
            # Get S&P 500 data
            sp500_data = self._get_sp500_data()
            if sp500_data is None:
                logger.warning(f"❌ No S&P 500 data available")
                return 1
            
            # Align data by dates
            aligned_stock, aligned_sp500 = self._align_data(hist_data, sp500_data)
            
            if len(aligned_stock) < 63:  # Need at least quarter data
                logger.warning(f"⚠️ Insufficient data for {symbol}: {len(aligned_stock)} days")
                return 50  # Return average rating
            
            # Calculate returns for each period
            period_performances = []
            
            for period, weight in zip(self.periods, self.weights):
                performance = self._calculate_period_performance(
                    aligned_stock, aligned_sp500, period
                )
                
                if performance is not None:
                    period_performances.append(performance * weight)
                else:
                    # If we can't calculate for this period, use 0
                    period_performances.append(0.0)
            
            # Calculate weighted average relative performance
            if not period_performances:
                return 1
            
            total_relative_performance = sum(period_performances)
            
            # Convert to 1-99 scale
            rs_rating = self._convert_to_rs_scale(total_relative_performance)
            
            logger.debug(f"📈 {symbol}: RS Rating = {rs_rating}")
            return rs_rating
            
        except Exception as e:
            logger.error(f"❌ RS Rating calculation error: {str(e)}")
            return 1
    
    def _get_sp500_data(self) -> Optional[pd.DataFrame]:
        """Get S&P 500 data with caching"""
        try:
            # Check cache (1 hour expiry)
            if (self.sp500_cache is not None and 
                self.cache_timestamp and 
                datetime.now() - self.cache_timestamp < timedelta(hours=1)):
                return self.sp500_cache
            
            # Fetch fresh S&P 500 data
            logger.info("📡 Fetching S&P 500 data...")
            ticker = yf.Ticker("^GSPC")
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=500)  # Get more data for alignment
            
            hist = ticker.history(
                start=start_date,
                end=end_date,
                interval="1d",
                auto_adjust=True,
                prepost=False,
                repair=True
            )
            
            if hist is not None and not hist.empty:
                self.sp500_cache = hist
                self.cache_timestamp = datetime.now()
                logger.info(f"✅ S&P 500 data cached: {len(hist)} days")
            else:
                logger.warning("⚠️ No S&P 500 data retrieved")
                
            return hist
            
        except Exception as e:
            logger.error(f"❌ Error getting S&P 500 data: {str(e)}")
            return None
    
    def _align_data(self, stock_data: pd.DataFrame, sp500_data: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        """Align stock and S&P 500 data by trading dates"""
        try:
            # Get close prices
            stock_closes = stock_data['Close']
            sp500_closes = sp500_data['Close']
            
            # Find common dates
            common_dates = stock_closes.index.intersection(sp500_closes.index)
            
            if len(common_dates) == 0:
                logger.warning("❌ No common dates between stock and S&P 500 data")
                return pd.Series(), pd.Series()
            
            # Align data
            aligned_stock = stock_closes.reindex(common_dates).dropna()
            aligned_sp500 = sp500_closes.reindex(common_dates).dropna()
            
            # Ensure both have the same dates
            final_dates = aligned_stock.index.intersection(aligned_sp500.index)
            aligned_stock = aligned_stock.reindex(final_dates)
            aligned_sp500 = aligned_sp500.reindex(final_dates)
            
            # Sort by date (most recent last)
            aligned_stock = aligned_stock.sort_index()
            aligned_sp500 = aligned_sp500.sort_index()
            
            logger.debug(f"📊 Aligned data: {len(aligned_stock)} common trading days")
            return aligned_stock, aligned_sp500
            
        except Exception as e:
            logger.error(f"❌ Data alignment error: {str(e)}")
            return pd.Series(), pd.Series()
    
    def _calculate_period_performance(self, stock_prices: pd.Series, sp500_prices: pd.Series, period: int) -> Optional[float]:
        """
        Calculate relative performance for a specific period
        
        Args:
            stock_prices: Aligned stock prices
            sp500_prices: Aligned S&P 500 prices  
            period: Number of days to look back
            
        Returns:
            Relative performance (stock % - sp500 %)
        """
        try:
            if len(stock_prices) < period:
                # Not enough data for this period
                return None
            
            # Get prices for the period (most recent 'period' days)
            end_price_stock = stock_prices.iloc[-1]
            start_price_stock = stock_prices.iloc[-period]
            
            end_price_sp500 = sp500_prices.iloc[-1]
            start_price_sp500 = sp500_prices.iloc[-period]
            
            # Calculate percentage returns
            stock_return = ((end_price_stock - start_price_stock) / start_price_stock) * 100
            sp500_return = ((end_price_sp500 - start_price_sp500) / start_price_sp500) * 100
            
            # Relative performance
            relative_performance = stock_return - sp500_return
            
            logger.debug(f"📈 {period}d: Stock {stock_return:.1f}% vs S&P500 {sp500_return:.1f}% = {relative_performance:.1f}%")
            
            return relative_performance
            
        except Exception as e:
            logger.error(f"❌ Period performance calculation error: {str(e)}")
            return None
    
    def _convert_to_rs_scale(self, relative_performance: float) -> int:
        """
        Convert relative performance to 1-99 RS Rating scale
        
        Based on empirical observations of high-performing stocks:
        - Exceptional performance (>50% outperformance): 90-99
        - Strong performance (20-50% outperformance): 80-89  
        - Good performance (5-20% outperformance): 70-79
        - Average performance (-5 to 5% vs market): 50-69
        - Underperformance (<-5%): 1-49
        """
        try:
            if relative_performance >= 50:
                # Exceptional - map 50%+ to 90-99
                excess = min(relative_performance - 50, 50)  # Cap at 100% excess
                rating = 90 + int((excess / 50) * 9)
                
            elif relative_performance >= 20:
                # Strong - map 20-50% to 80-89
                rating = 80 + int(((relative_performance - 20) / 30) * 9)
                
            elif relative_performance >= 5:
                # Good - map 5-20% to 70-79
                rating = 70 + int(((relative_performance - 5) / 15) * 9)
                
            elif relative_performance >= -5:
                # Average - map -5 to 5% to 50-69
                rating = 50 + int(((relative_performance + 5) / 10) * 19)
                
            else:
                # Underperforming - map below -5% to 1-49
                # More negative = lower rating
                negative_excess = min(abs(relative_performance + 5), 45)  # Cap at -50%
                rating = 49 - int((negative_excess / 45) * 48)
            
            # Ensure rating is within bounds
            rating = max(1, min(99, rating))
            
            return rating
            
        except Exception as e:
            logger.error(f"❌ RS scale conversion error: {str(e)}")
            return 1
    
    def calculate_batch_rs_ratings(self, stocks_data: Dict[str, Dict]) -> Dict[str, int]:
        """
        Calculate RS Ratings for multiple stocks
        
        Args:
            stocks_data: Dictionary mapping symbols to stock data
            
        Returns:
            Dictionary mapping symbols to RS ratings
        """
        rs_ratings = {}
        
        logger.info(f"📊 Calculating RS Ratings for {len(stocks_data)} stocks...")
        
        for symbol, stock_data in stocks_data.items():
            rs_rating = self.calculate_rs_rating(stock_data)
            rs_ratings[symbol] = rs_rating
        
        # Log summary statistics
        if rs_ratings:
            ratings = list(rs_ratings.values())
            avg_rating = np.mean(ratings)
            high_rs_count = sum(1 for r in ratings if r >= 70)
            
            logger.info(f"📈 RS Rating Summary: Avg={avg_rating:.1f}, High RS (≥70): {high_rs_count}/{len(ratings)}")
        
        return rs_ratings
    
    def get_rating_description(self, rs_rating: int) -> str:
        """Get descriptive text for RS rating"""
        if rs_rating >= 90:
            return "Exceptional"
        elif rs_rating >= 80:
            return "Strong"
        elif rs_rating >= 70:
            return "Good"
        elif rs_rating >= 50:
            return "Average"
        else:
            return "Weak"