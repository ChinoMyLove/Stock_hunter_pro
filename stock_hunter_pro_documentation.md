# Stock Hunter Pro - תיעוד מקיף לפרויקט

## 📋 סקירה כללית

**Stock Hunter Pro** - מערכת Python + Flask לניתוח מניות בסגנון premium financial software עם:
- עיצוב יוקרתי כהה עם נגיעות ניאון מתוחכמות
- יישום קריטריוני Minervini (8-Point Trend Template)
- חישוב RS Rating מדויק
- מערכת Watch List מתקדמת

## 🎯 פונקציונליות נדרשת - שלב 1

### Core Features:
- ✅ **Trend Template Analysis** - קריטריוני Minervini
- ✅ **Watch List** - מניות שעברו את הקריטריונים
- ❌ שאר הכלים (לעתיד)

### אפשרויות קלט נתונים:
1. **CSV Upload** - טעינת קובץ עם רשימת סימולים
2. **Load Sample** - 16 מניות מוכנות לבדיקה מהירה
3. **Manual Input**:
   - מניה בודדת
   - רשימת מניות מופרדות בפסיק

## 📊 מבנה הנתונים

### קלט CSV:
```csv
Company Name,Ticker,Last Close,Avg Volume,Market Cap (mil),52 Week High,52 Week Low
Example Corp,AAPL,150.00,50000000,2500000,180.00,120.00
```
**שימוש**: רק עמודת **Ticker** - שאר הנתונים מ-yfinance

### נתונים מ-yfinance:
- **Trend Template**: נתונים של שנה (252 ימים)
- **Watch List מניות**: נתונים של 5 שנים
- **נתונים נדרשים**:
  - מחיר נוכחי
  - 50MA, 150MA, 200MA
  - 52-week high/low
  - נתונים היסטוריים לRS Rating
  - נתוני S&P 500 להשוואה

## 🔬 חישובים מדויקים

### RS Rating Calculation:
**4 תקופות השוואה לעומת S&P 500:**
- 63 ימים (רבעון)
- 126 ימים (חצי שנה)
- 189 ימים (3 רבעונים)
- 252 ימים (שנה)

**נוסחה:**
```python
def calculate_rs_rating(stock_returns, sp500_returns):
    """
    דוגמה - AVGO:
    63 days: AVGO +11.0% vs S&P500 +1.9% = +9.1%
    126 days: AVGO +12.0% vs S&P500 +3.9% = +8.1%
    189 days: AVGO +35.7% vs S&P500 +8.2% = +27.5%
    252 days: AVGO +124.0% vs S&P500 +15.2% = +108.8%
    
    Result: RS Rating = 83 (vs IBD official = 80+)
    """
    # חישוב משוקלל של כל התקופות
    # החזרת ציון 1-99
```

### Minervini 8-Point Trend Template:
1. **Price > 50MA & 200MA** ✓ REQ
2. **150MA > 200MA** ✓ REQ
3. **200MA trending up** ✓ REQ
4. **50MA > other MAs** ✓ REQ
5. **Price > 30% above 52W low** ✓ REQ
6. **Within 25% of 52W high** ✓ REQ
7. **RS Rating ≥ 70** ✓ REQ
8. **(אופציונלי 8)** - לדיון

## 🏗️ מבנה הפרויקט המודולרי

```
📁 stock_hunter_pro/
├── app.py                 # Flask backend server ✅
├── index.html             # Premium frontend interface ✅
├── requirements.txt       # Python dependencies ✅
├── setup.py              # Installation script ✅
├── run.py                # Quick launcher ✅
├── .env.example          # Environment template ✅
├── README.md             # User documentation ✅
├── start.bat             # Windows launcher ❌
├── start.sh              # Linux/Mac launcher ❌
├── 📁 utils/
│   ├── __init__.py            # Package init ✅
│   ├── data_fetcher.py        # yFinance handler ✅
│   ├── minervini_criteria.py  # 8-point analysis ✅
│   ├── rs_calculator.py       # RS Rating calculator ✅
│   └── file_handler.py        # File operations ✅
├── 📁 data/
│   ├── sample_stocks.csv      # Sample data ✅
│   ├── watchlist_history.json # Watchlist storage ✅
│   └── results/               # Export directory
└── 📁 logs/                   # Log files (auto-created)
```

## 🎨 מפרט עיצוב Premium Financial

### צבעוניות:
```css
/* Primary Colors */
--bg-primary: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
--bg-secondary: rgba(26, 26, 26, 0.8);
--accent-gold: #FFD700;
--accent-silver: #C0C0C0;
--accent-blue: #1e3a8a;
--neon-blue: #00BFFF;

/* Status Colors */
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;
--neutral: #6B7280;
```

### Glass Morphism:
```css
.glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Micro-Animations:
```css
.smooth-transition {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 191, 255, 0.3);
}

.number-counter {
    animation: countUp 1s ease-out;
}
```

## 📈 טבלת תוצאות

### עמודות נדרשות:
| Column | Description | Data Source |
|--------|-------------|-------------|
| SYMBOL | סימול המניה | CSV Input |
| STATUS | ✅/❌ עבר קריטריונים | Calculated |
| PRICE | מחיר נוכחי | yfinance |
| 50MA | ממוצע נע 50 ימים | yfinance |
| 150MA | ממוצע נע 150 ימים | yfinance |
| 200MA | ממוצע נע 200 ימים | yfinance |
| 52W LOW | נמוך 52 שבועות | yfinance |
| 52W HIGH | גבוה 52 שבועות | yfinance |
| FROM LOW % | % מהנמוך השנתי | Calculated |
| FROM HIGH % | % מהגבוה השנתי | Calculated |
| RS RATING | דירוג יחסי 1-99 | Calculated |
| 200MA TREND | מגמת ממוצע 200 | Calculated |
| FAIL REASON | סיבת כישלון | Calculated |
| WATCH | כוכב למעקב | User Action |

## ⚡ ביצועים וטעינה

### yfinance Optimization:
```python
# מגבלות ידועות:
# - ~2000 בקשות/שעה
# - batch של 10-20 סימולים מומלץ
# - השהיות אקראיות מומלצות

def fetch_stock_data(tickers, period="1y"):
    """
    טעינה אופטימלית:
    1. ניסיון טעינה מקסימלית
    2. אם נכשל - מעבר ל-batch processing
    3. progress bar לחוויית משתמש
    """
```

### שמירה מקומית:
```json
{
  "watchlist": [
    {
      "symbol": "AAPL",
      "date_added": "2025-06-20",
      "entry_price": 150.00,
      "rs_rating": 83,
      "status": "active"
    }
  ],
  "history": [
    {
      "date": "2025-06-20",
      "total_analyzed": 50,
      "passed_criteria": 12,
      "success_rate": 24
    }
  ]
}
```

## 🚀 סטטוס פיתוח - שלב 1 הושלם!

### ✅ קבצים שנוצרו - Core Functionality:
1. ✅ **app.py** - Backend Flask Server מלא
2. ✅ **utils/data_fetcher.py** - yFinance data handler מתקדם
3. ✅ **utils/minervini_criteria.py** - יישום מדויק של 8 קריטריונים  
4. ✅ **utils/rs_calculator.py** - חישוב RS Rating לפי IBD
5. ✅ **utils/file_handler.py** - ניהול קבצים ו-watchlist
6. ✅ **utils/__init__.py** - אתחול חבילה
7. ✅ **requirements.txt** - כל ה-dependencies
8. ✅ **README.md** - תיעוד מלא למשתמש
9. ✅ **data/sample_stocks.csv** - 16 מניות לדוגמה
10. ✅ **data/watchlist_history.json** - דוגמת watchlist
11. ✅ **setup.py** - סקריפט התקנה אוטומטי
12. ✅ **run.py** - launcher מתקדם
13. ✅ **.env.example** - הגדרות סביבה

### ✅ קבצים קיימים מראש:
1. ✅ **index.html** - Frontend מתקדם עם Glass Morphism
2. ✅ CSS premium מובנה
3. ✅ JavaScript אינטראקטיבי
4. ✅ אנימציות ואפקטים

### ❌ נותר להשלמה:
1. ❌ **start.bat & start.sh** - סקריפטי הפעלה פלטפורמה (חלקי)
2. ❌ בדיקה ראשונית של הפעלת המערכת
3. ❌ תיקוני bugs אפשריים

## 📝 דרישות טכניות

### Dependencies:
```txt
Flask==3.0.0
Flask-CORS==4.0.0
yfinance>=0.2.18
pandas>=1.5.0
numpy>=1.24.0
requests>=2.31.0
plotly>=5.15.0
python-dotenv>=1.0.0
```

### דוגמת מניות לטעינה מהירה (16):
```python
SAMPLE_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN",
    "TSLA", "NVDA", "META", "NFLX",
    "AVGO", "ORCL", "CRM", "ADBE",
    "PYPL", "INTC", "AMD", "QCOM"
]
```

## 🎯 מדדי הצלחה

### ביצועים:
- טעינת נתונים < 30 שניות עבור 50 מניות
- UI responsive < 100ms
- דיוק RS Rating ±3 נקודות מ-IBD

### חוויית משתמש:
- ממשק אינטואיטיבי וברור
- עיצוב professional ומרשים
- פידבק חזותי מיידי

## 🔧 הוראות התקנה

### התקנה אוטומטית:
```bash
# 1. יצירת תיקיית פרויקט
mkdir stock-hunter-pro
cd stock-hunter-pro

# 2. העתקת קבצים (מ-artifacts)
# העתק את כל הקבצים למבנה הנכון

# 3. הרצת התקנה
python setup.py

# 4. הפעלה
python run.py
```

### התקנה ידנית:
```bash
# 1. התקנת dependencies
pip install -r requirements.txt

# 2. יצירת תיקיות
mkdir data data/results logs

# 3. הפעלה
python app.py
```

## 🌐 API Endpoints

### Core Endpoints:
- `GET /` - Frontend interface
- `GET /health` - System health check
- `POST /api/analyze` - Stock analysis
- `GET /api/sample-data` - Sample stocks

### Watchlist Management:
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist` - Remove from watchlist

---

## 🎯 **פרומפט לשיחה הבאה:**

```
"השלם את Stock Hunter Pro - יש לי כבר את כל הקבצים הבסיסיים:
✅ app.py (Flask backend)
✅ index.html (Frontend premium) 
✅ utils/ (data_fetcher, minervini_criteria, rs_calculator, file_handler)
✅ requirements.txt
✅ README.md
✅ setup.py & run.py
✅ data/ (sample files)

צריך להשלים:
1. start.bat & start.sh (הסקריפטים נותרו חלקיים)
2. בדיקת התקנה ראשונית
3. תיקון bugs אפשריים בחיבור Frontend-Backend  
4. הוראות הפעלה סופיות

המטרה: מערכת פועלת מלאה לניתוח מניות עם Minervini criteria."
```

## 📋 רשימת קבצים להעתקה:
1. כל הקבצים מ-Artifacts צריכים להישמר במבנה התיקיות הנכון
2. וודא שיש חיבור בין index.html ל-Flask backend
3. בדוק שכל הimports ב-Python עובדים

## ⚡ צעדים ראשונים לאחר השלמה:
```bash
python setup.py    # התקנה אוטומטית
python run.py      # הפעלה מהירה
# או
python app.py      # הפעלה ישירה
```

**🎯 יעד: מערכת פועלת להרצת ניתוח Minervini על מניות!**