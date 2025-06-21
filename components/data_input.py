import streamlit as st
import pandas as pd
import io

# Sample stocks for quick testing
SAMPLE_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN",
    "TSLA", "NVDA", "META", "NFLX", 
    "AVGO", "ORCL", "CRM", "ADBE",
    "PYPL", "INTC", "AMD", "QCOM"
]

def render_data_input():
    """רנדור אזור קלט הנתונים"""
    
    st.markdown("""
    <div class="glass-card" style="padding: 1.5rem; margin: 1rem 0;">
        <h3 style="color: #00BFFF; margin-top: 0;">📊 Data Source Configuration</h3>
        <p style="color: #C0C0C0; margin-bottom: 1.5rem;">
            Choose your data input method below. All stock data is fetched in real-time from Yahoo Finance.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # יצירת 3 טאבים לשיטות קלט שונות
    tab1, tab2, tab3 = st.tabs(["📁 CSV Upload", "⚡ Load Sample", "✏️ Manual Input"])
    
    with tab1:
        csv_data = render_csv_upload()
        if csv_data is not None:
            return csv_data
    
    with tab2:
        sample_data = render_sample_loader()
        if sample_data is not None:
            return sample_data
    
    with tab3:
        manual_data = render_manual_input()
        if manual_data is not None:
            return manual_data
    
    return None

def render_csv_upload():
    """רנדור אזור העלאת CSV"""
    
    st.markdown("""
    <div class="upload-area">
        <div class="upload-icon">📊</div>
        <h4>Drop your stock list here or click to browse</h4>
        <p>Supports CSV, Excel, TSV files • Maximum 50MB • No limit on stock count (auto-batched)</p>
    </div>
    """, unsafe_allow_html=True)
    
    uploaded_file = st.file_uploader(
        "Choose a file",
        type=['csv', 'xlsx', 'xls', 'tsv'],
        help="Upload a file containing stock symbols. The file should have a column with ticker symbols."
    )
    
    if uploaded_file is not None:
        try:
            # קריאת הקובץ לפי סוג
            if uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(uploaded_file)
            elif uploaded_file.name.endswith('.tsv'):
                df = pd.read_csv(uploaded_file, sep='\t')
            
            # הצגת תצוגה מקדימה
            st.success(f"✅ File loaded successfully! Found {len(df)} rows.")
            st.write("**File Preview:**")
            st.dataframe(df.head(), use_container_width=True)
            
            # זיהוי עמודת הטיקרים
            ticker_column = identify_ticker_column(df)
            
            if ticker_column:
                st.info(f"🎯 Detected ticker column: **{ticker_column}**")
                
                # חילוץ הטיקרים
                tickers = df[ticker_column].dropna().astype(str).str.strip().str.upper().tolist()
                # הסרת ערכים ריקים או לא תקינים
                tickers = [t for t in tickers if t and len(t) <= 5 and t.replace('.', '').isalnum()]
                
                if tickers:
                    st.success(f"🚀 Ready to analyze {len(tickers)} stocks!")
                    
                    # יצירת DataFrame עם הטיקרים
                    return pd.DataFrame({'Ticker': tickers})
                else:
                    st.error("❌ No valid ticker symbols found in the file.")
            else:
                st.error("❌ Could not identify ticker column. Please ensure your file contains stock symbols.")
                
        except Exception as e:
            st.error(f"❌ Error reading file: {str(e)}")
    
    return None

def render_sample_loader():
    """רנדור טעינת דוגמה מהירה"""
    
    st.markdown("""
    <div style="text-align: center; padding: 1rem;">
        <h4>🚀 Quick Analysis with Sample Stocks</h4>
        <p>Load 16 pre-selected stocks for immediate analysis</p>
    </div>
    """, unsafe_allow_html=True)
    
    # הצגת המניות בלו sample
    col1, col2, col3, col4 = st.columns(4)
    
    for i, ticker in enumerate(SAMPLE_STOCKS):
        with [col1, col2, col3, col4][i % 4]:
            st.markdown(f"""
            <div style="
                background: rgba(0, 191, 255, 0.1);
                border: 1px solid rgba(0, 191, 255, 0.3);
                border-radius: 8px;
                padding: 0.5rem;
                text-align: center;
                margin: 0.25rem 0;
                font-weight: 600;
                color: #00BFFF;
            ">{ticker}</div>
            """, unsafe_allow_html=True)
    
    if st.button("🚀 Load Sample & Analyze", key="load_sample", type="primary"):
        st.success(f"✅ Loaded {len(SAMPLE_STOCKS)} sample stocks!")
        return pd.DataFrame({'Ticker': SAMPLE_STOCKS})
    
    return None

def render_manual_input():
    """רנדור קלט ידני"""
    
    st.markdown("""
    <div style="text-align: center; padding: 1rem;">
        <h4>✏️ Manual Stock Entry</h4>
        <p>Enter individual stocks or a comma-separated list</p>
    </div>
    """, unsafe_allow_html=True)
    
    # קלט טקסט
    manual_input = st.text_area(
        "Enter stock symbols:",
        placeholder="Examples:\nAAPL\nor\nAAPL, MSFT, GOOGL, TSLA",
        height=100,
        help="Enter one symbol per line or separate multiple symbols with commas"
    )
    
    if manual_input.strip():
        # עיבוד הקלט
        tickers = []
        
        # פיצול לפי שורות ופסיקים
        for line in manual_input.strip().split('\n'):
            for ticker in line.split(','):
                ticker = ticker.strip().upper()
                if ticker and len(ticker) <= 5 and ticker.replace('.', '').isalnum():
                    tickers.append(ticker)
        
        # הסרת כפילויות
        tickers = list(dict.fromkeys(tickers))
        
        if tickers:
            st.info(f"🎯 Found {len(tickers)} symbols: {', '.join(tickers)}")
            
            if st.button("🚀 Analyze These Stocks", key="analyze_manual", type="primary"):
                st.success(f"✅ Ready to analyze {len(tickers)} stocks!")
                return pd.DataFrame({'Ticker': tickers})
        else:
            st.warning("⚠️ Please enter valid stock symbols")
    
    return None

def identify_ticker_column(df):
    """זיהוי אוטומטי של עמודת הטיקרים"""
    
    # רשימת שמות עמודות אפשריות
    possible_names = [
        'ticker', 'symbol', 'stock', 'tickers', 'symbols',
        'stock_symbol', 'stock_ticker', 'company_ticker'
    ]
    
    # חיפוש לפי שם העמודה
    for col in df.columns:
        if col.lower().strip() in possible_names:
            return col
    
    # חיפוש לפי תכן העמודה (ערכים קצרים שנראים כמו טיקרים)
    for col in df.columns:
        if df[col].dtype == 'object':
            # בדיקה אם רוב הערכים נראים כמו טיקרים
            sample_values = df[col].dropna().astype(str).head(10)
            ticker_like = sum(1 for val in sample_values 
                            if len(val.strip()) <= 5 and val.strip().replace('.', '').isalnum())
            
            if ticker_like >= len(sample_values) * 0.8:  # 80% נראים כמו טיקרים
                return col
    
    return None