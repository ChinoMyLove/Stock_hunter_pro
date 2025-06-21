import streamlit as st
import pandas as pd
import sys
import os
from pathlib import Path

# הוספת תיקיות לנתיב
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

# Import components
from components.sidebar import render_sidebar
from components.dashboard_stats import render_dashboard_stats
from components.data_input import render_data_input
from components.trend_analysis import render_trend_analysis
from components.watchlist import render_watchlist

# Import utilities
from utils.data_fetcher import fetch_stock_data
from utils.minervini_criteria import analyze_minervini_criteria
from utils.rs_calculator import calculate_rs_rating
from utils.file_handler import load_watchlist, save_watchlist

# הגדרת עמוד
st.set_page_config(
    page_title="Stock Hunter Pro",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# טעינת CSS מותאם אישית
def load_css():
    """טעינת עיצוב מותאם אישית"""
    css_file = current_dir / "styles" / "premium_theme.css"
    if css_file.exists():
        with open(css_file) as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

def initialize_session_state():
    """אתחול משתני session"""
    if 'analyzed_stocks' not in st.session_state:
        st.session_state.analyzed_stocks = pd.DataFrame()
    if 'watchlist' not in st.session_state:
        st.session_state.watchlist = load_watchlist()
    if 'analysis_stats' not in st.session_state:
        st.session_state.analysis_stats = {
            'total_analyzed': 0,
            'passed_criteria': 0,
            'success_rate': 0,
            'watch_listed': 0
        }

def main():
    """פונקציה ראשית"""
    # טעינת עיצוב ואתחול
    load_css()
    initialize_session_state()
    
    # כותרת ראשית
    st.markdown("""
    <div class="main-header">
        <h1>📈 Stock Hunter Pro</h1>
        <p>Systematic stock selection using Minervini's proven 8-criteria framework</p>
    </div>
    """, unsafe_allow_html=True)
    
    # סיידבר
    with st.sidebar:
        selected_tool = render_sidebar()
    
    # תוכן ראשי לפי בחירת המשתמש
    if selected_tool == "Trend Template":
        # דשבורד סטטיסטיקות
        render_dashboard_stats(st.session_state.analysis_stats)
        
        # אזור קלט נתונים
        stock_data = render_data_input()
        
        if stock_data is not None and not stock_data.empty:
            # ניתוח טרנד
            analysis_results = render_trend_analysis(stock_data)
            
            if analysis_results is not None:
                # עדכון session state
                st.session_state.analyzed_stocks = analysis_results
                
                # עדכון סטטיסטיקות
                total = len(analysis_results)
                passed = len(analysis_results[analysis_results['STATUS'] == '✅'])
                success_rate = (passed / total * 100) if total > 0 else 0
                
                st.session_state.analysis_stats.update({
                    'total_analyzed': total,
                    'passed_criteria': passed,
                    'success_rate': success_rate,
                    'watch_listed': len(st.session_state.watchlist)
                })
                
                # רענון הדשבורד
                st.rerun()
    
    elif selected_tool == "Watch List":
        render_watchlist(st.session_state.watchlist)
    
    else:
        st.info("🚧 הכלי הזה יהיה זמין בקרוב...")

if __name__ == "__main__":
    main()