"""
Stock Hunter Pro - Minervini Criteria Module
Implementation of Mark Minervini's 8-Point Trend Template Analysis
"""

import logging
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

class MinerviniAnalyzer:
    """
    Implementation of Mark Minervini's 8-Point Trend Template
    
    The 8 criteria for trend template:
    1. Price > 150MA & 200MA ✓ REQ
    2. 150MA > 200MA ✓ REQ  
    3. 200MA trending up ✓ REQ
    4. 50MA > 150MA & 200MA ✓ REQ
    5. Price > 30% above 52W low ✓ REQ
    6. Within 25% of 52W high ✓ REQ
    7. RS Rating ≥ 70 ✓ REQ
    8. (Optional criteria - for discussion)
    """
    
    def __init__(self):
        self.criteria_weights = {
            'price_above_mas': 1.0,      # Criterion 1
            'ma_150_above_200': 1.0,     # Criterion 2  
            'ma_200_trending_up': 1.0,   # Criterion 3
            'ma_50_above_others': 1.0,   # Criterion 4
            'above_52w_low': 1.0,        # Criterion 5
            'near_52w_high': 1.0,        # Criterion 6
            'rs_rating_strong': 1.0      # Criterion 7
        }
        logger.info("📊 MinerviniAnalyzer initialized with 8-Point Trend Template")
    
    def analyze_stock(self, stock_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform complete Minervini analysis on a stock
        
        Args:
            stock_data: Dictionary containing stock data from DataFetcher (includes RS rating)
            
        Returns:
            Dictionary with analysis results and pass/fail status
        """
        try:
            # Extract key metrics from stock_data - matching DataFetcher output
            symbol = stock_data.get('symbol', 'Unknown')
            price = stock_data.get('price', 0)  # Current price
            ma_50 = stock_data.get('ma_50', 0)
            ma_150 = stock_data.get('ma_150', 0)
            ma_200 = stock_data.get('ma_200', 0)
            week_52_high = stock_data.get('week_52_high', 0)
            week_52_low = stock_data.get('week_52_low', 0)
            ma_200_trending_up = stock_data.get('ma_200_trending_up', False)
            
            # Get precalculated percentages
            from_low_pct = stock_data.get('from_low_pct', 0)
            from_high_pct = stock_data.get('from_high_pct', 0)
            
            # Validate data
            if not all([price, ma_50, ma_150, ma_200, week_52_high, week_52_low]):
                return {
                    'passed': False,
                    'fail_reasons': ['Insufficient data for analysis'],
                    'score': 0,
                    'max_score': 7,
                    'details': {}
                }
            
            # Apply each criterion
            criteria_results = {}
            fail_reasons = []
            
            # Criterion 1: Price > 150MA & 200MA
            criteria_1 = self._check_price_above_mas(price, ma_150, ma_200)
            criteria_results['price_above_mas'] = criteria_1
            if not criteria_1['passes']:
                fail_reasons.append(criteria_1['reason'])
            
            # Criterion 2: 150MA > 200MA
            criteria_2 = self._check_ma_150_above_200(ma_150, ma_200)
            criteria_results['ma_150_above_200'] = criteria_2
            if not criteria_2['passes']:
                fail_reasons.append(criteria_2['reason'])
            
            # Criterion 3: 200MA trending up
            criteria_3 = self._check_ma_200_trending_up(ma_200_trending_up)
            criteria_results['ma_200_trending_up'] = criteria_3
            if not criteria_3['passes']:
                fail_reasons.append(criteria_3['reason'])
            
            # Criterion 4: 50MA > 150MA & 200MA  
            criteria_4 = self._check_ma_50_above_others(ma_50, ma_150, ma_200)
            criteria_results['ma_50_above_others'] = criteria_4
            if not criteria_4['passes']:
                fail_reasons.append(criteria_4['reason'])
            
            # Criterion 5: Price > 30% above 52W low
            criteria_5 = self._check_above_52w_low(from_low_pct)
            criteria_results['above_52w_low'] = criteria_5
            if not criteria_5['passes']:
                fail_reasons.append(criteria_5['reason'])
            
            # Criterion 6: Within 25% of 52W high
            criteria_6 = self._check_near_52w_high(from_high_pct)
            criteria_results['near_52w_high'] = criteria_6
            if not criteria_6['passes']:
                fail_reasons.append(criteria_6['reason'])
            
            # Calculate overall results (excluding RS rating for now)
            technical_criteria = [criteria_1, criteria_2, criteria_3, criteria_4, criteria_5, criteria_6]
            passes_technical = all(c['passes'] for c in technical_criteria)
            technical_score = sum(c['passes'] for c in technical_criteria)
            
            # Overall pass/fail based on technical criteria
            passed = passes_technical
            
            return {
                'passed': passed,
                'fail_reasons': fail_reasons,
                'score': technical_score,
                'max_score': 6,  # Technical criteria only
                'technical_score': technical_score,
                'details': criteria_results,
                'summary': self._generate_summary(criteria_results, passed),
                'symbol': symbol
            }
            
        except Exception as e:
            logger.error(f"❌ Minervini analysis error for {stock_data.get('symbol', 'Unknown')}: {str(e)}")
            return {
                'passed': False,
                'fail_reasons': [f'Analysis error: {str(e)}'],
                'score': 0,
                'max_score': 6,
                'details': {},
                'symbol': stock_data.get('symbol', 'Unknown')
            }
    
    def _check_price_above_mas(self, price: float, ma_150: float, ma_200: float) -> Dict[str, Any]:
        """Criterion 1: Price > 150MA & 200MA"""
        above_150 = price > ma_150
        above_200 = price > ma_200
        passes = above_150 and above_200
        
        if not passes:
            if not above_150 and not above_200:
                reason = f"Price below both 150MA (${ma_150:.2f}) & 200MA (${ma_200:.2f})"
            elif not above_150:
                reason = f"Price below 150MA (${ma_150:.2f})"
            else:
                reason = f"Price below 200MA (${ma_200:.2f})"
        else:
            reason = ""
        
        return {
            'passes': passes,
            'reason': reason,
            'details': {
                'price': price,
                'ma_150': ma_150,
                'ma_200': ma_200,
                'above_150': above_150,
                'above_200': above_200
            }
        }
    
    def _check_ma_150_above_200(self, ma_150: float, ma_200: float) -> Dict[str, Any]:
        """Criterion 2: 150MA > 200MA"""
        passes = ma_150 > ma_200
        
        return {
            'passes': passes,
            'reason': f"150MA (${ma_150:.2f}) below 200MA (${ma_200:.2f})" if not passes else "",
            'details': {
                'ma_150': ma_150,
                'ma_200': ma_200,
                'difference': ma_150 - ma_200
            }
        }
    
    def _check_ma_200_trending_up(self, ma_200_trending_up: bool) -> Dict[str, Any]:
        """Criterion 3: 200MA trending up"""
        passes = ma_200_trending_up
        
        return {
            'passes': passes,
            'reason': "200MA not trending up" if not passes else "",
            'details': {
                'trending_up': ma_200_trending_up
            }
        }
    
    def _check_ma_50_above_others(self, ma_50: float, ma_150: float, ma_200: float) -> Dict[str, Any]:
        """Criterion 4: 50MA > 150MA & 200MA"""
        above_150 = ma_50 > ma_150
        above_200 = ma_50 > ma_200
        passes = above_150 and above_200
        
        if not passes:
            if not above_150 and not above_200:
                reason = f"50MA below both 150MA & 200MA"
            elif not above_150:
                reason = f"50MA (${ma_50:.2f}) below 150MA (${ma_150:.2f})"
            else:
                reason = f"50MA (${ma_50:.2f}) below 200MA (${ma_200:.2f})"
        else:
            reason = ""
        
        return {
            'passes': passes,
            'reason': reason,
            'details': {
                'ma_50': ma_50,
                'ma_150': ma_150,
                'ma_200': ma_200,
                'above_150': above_150,
                'above_200': above_200
            }
        }
    
    def _check_above_52w_low(self, from_low_pct: float) -> Dict[str, Any]:
        """Criterion 5: Price > 30% above 52W low"""
        passes = from_low_pct >= 30.0
        
        return {
            'passes': passes,
            'reason': f"Only {from_low_pct:.1f}% above 52W low (need ≥30%)" if not passes else "",
            'details': {
                'from_low_pct': from_low_pct,
                'threshold': 30.0
            }
        }
    
    def _check_near_52w_high(self, from_high_pct: float) -> Dict[str, Any]:
        """Criterion 6: Within 25% of 52W high"""
        # from_high_pct should be the percentage BELOW the high
        # So for "within 25%", the stock should be no more than 25% below the high
        passes = abs(from_high_pct) <= 25.0
        
        return {
            'passes': passes,
            'reason': f"{abs(from_high_pct):.1f}% below 52W high (need ≤25%)" if not passes else "",
            'details': {
                'from_high_pct': from_high_pct,
                'threshold': 25.0
            }
        }
    
    def _generate_summary(self, criteria_results: Dict, passes_all: bool) -> str:
        """Generate a human-readable summary"""
        if passes_all:
            return "✅ All technical criteria passed - Strong trend template"
        
        failed_count = sum(1 for c in criteria_results.values() if not c['passes'])
        passed_count = len(criteria_results) - failed_count
        
        return f"⚠️ {passed_count}/{len(criteria_results)} criteria passed"
    
    def analyze_with_rs_rating(self, stock_data: Dict[str, Any], rs_rating: int) -> Dict[str, Any]:
        """
        Enhanced analysis including RS Rating
        
        Args:
            stock_data: Stock data from DataFetcher
            rs_rating: RS Rating from RSRatingCalculator
            
        Returns:
            Complete analysis including RS Rating criterion
        """
        # Get base technical analysis
        base_analysis = self.analyze_stock(stock_data)
        
        # Add RS Rating criterion
        rs_criterion = self._check_rs_rating_strong(rs_rating)
        base_analysis['details']['rs_rating_strong'] = rs_criterion
        
        # Update pass/fail based on RS rating too
        all_criteria = list(base_analysis['details'].values())
        passes_all_including_rs = all(c['passes'] for c in all_criteria)
        total_score = sum(c['passes'] for c in all_criteria)
        
        if not rs_criterion['passes']:
            base_analysis['fail_reasons'].append(rs_criterion['reason'])
        
        # Update final results
        base_analysis.update({
            'passed': passes_all_including_rs,
            'score': total_score,
            'max_score': 7,  # Now including RS rating
            'rs_rating': rs_rating,
            'summary': self._generate_summary_with_rs(all_criteria, passes_all_including_rs)
        })
        
        return base_analysis
    
    def _check_rs_rating_strong(self, rs_rating: int) -> Dict[str, Any]:
        """Criterion 7: RS Rating ≥ 70"""
        passes = rs_rating >= 70
        
        return {
            'passes': passes,
            'reason': f"RS Rating {rs_rating} below 70" if not passes else "",
            'details': {
                'rs_rating': rs_rating,
                'threshold': 70
            }
        }
    
    def _generate_summary_with_rs(self, criteria_results: List, passes_all: bool) -> str:
        """Generate summary including RS rating"""
        if passes_all:
            return "✅ All Minervini criteria passed - Perfect trend template"
        
        failed_count = sum(1 for c in criteria_results if not c['passes'])
        passed_count = len(criteria_results) - failed_count
        
        return f"⚠️ {passed_count}/{len(criteria_results)} criteria passed"
    
    def get_criteria_descriptions(self) -> Dict[str, str]:
        """Get descriptions of all criteria for UI display"""
        return {
            'price_above_mas': '1. Price > 150MA & 200MA',
            'ma_150_above_200': '2. 150MA > 200MA', 
            'ma_200_trending_up': '3. 200MA trending up',
            'ma_50_above_others': '4. 50MA > other MAs',
            'above_52w_low': '5. Price > 30% above 52W low',
            'near_52w_high': '6. Within 25% of 52W high',
            'rs_rating_strong': '7. RS Rating ≥ 70'
        }