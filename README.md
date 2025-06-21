# 📈 Stock Hunter Pro - Professional Stock Analysis Platform

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Stock Hunter Pro** is a professional-grade stock analysis platform implementing Mark Minervini's proven 8-Point Trend Template methodology with accurate RS Rating calculations.

## ✨ Features

### 🎯 Core Analysis Tools
- **Minervini 8-Point Trend Template** - Systematic stock selection using proven criteria
- **RS Rating Calculator** - Accurate relative strength analysis vs S&P 500
- **Watch List Management** - Track and manage promising stocks
- **Batch Processing** - Analyze hundreds of stocks efficiently

### 🎨 Premium Interface
- **Glass Morphism Design** - Modern, professional dark theme
- **Real-time Updates** - Live data fetching and analysis
- **Interactive Dashboard** - Comprehensive statistics and metrics
- **Export Capabilities** - Save results in CSV format

### ⚡ Performance Optimized
- **Parallel Processing** - Multi-threaded analysis for speed
- **Smart Caching** - Optimized data fetching with rate limiting
- **Auto-batching** - Handles large datasets seamlessly

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Internet connection for market data

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-repo/stock-hunter-pro.git
cd stock-hunter-pro
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Start the application**
```bash
python app.py
```

4. **Open your browser**
Navigate to: http://localhost:5000

## 📊 How It Works

### Minervini 8-Point Trend Template

Stock Hunter Pro implements Mark Minervini's proven criteria:

1. **Price > 150MA & 200MA** ✓ Required
2. **150MA > 200MA** ✓ Required  
3. **200MA trending up** ✓ Required
4. **50MA > other MAs** ✓ Required
5. **Price > 30% above 52W low** ✓ Required
6. **Within 25% of 52W high** ✓ Required
7. **RS Rating ≥ 70** ✓ Required
8. *(Optional criteria for advanced filtering)*

### RS Rating Calculation

Accurate implementation of IBD's methodology:

- **4 Time Periods**: 63, 126, 189, 252 trading days
- **Weighted Formula**: Recent performance emphasized
- **S&P 500 Comparison**: True relative strength measurement
- **1-99 Scale**: Industry-standard rating system

## 💡 Usage Guide

### 1. Data Input Options

**CSV Upload**: Upload your stock list
```csv
Company Name,Ticker,Last Close,Avg Volume,Market Cap (mil),52 Week High,52 Week Low
Apple Inc.,AAPL,150.00,50000000,2500000,180.00,120.00
```

**Sample Data**: Load 16 pre-configured stocks for testing

**Manual Entry**: Enter symbols directly (comma-separated)
```
AAPL, MSFT, GOOGL, AMZN, TSLA
```

### 2. Run Analysis

Click **"Run Analysis"** to start processing. The system will:
- Fetch real-time market data
- Calculate moving averages
- Compute RS Ratings
- Apply Minervini criteria
- Generate comprehensive results

### 3. Review Results

The results table shows:
- ✅/❌ Pass/Fail status
- Current price and moving averages
- 52-week high/low metrics
- RS Rating (1-99 scale)
- Detailed failure reasons

### 4. Manage Watch List

- **Add Stars**: Click the star icon to add stocks to your watch list
- **Track Performance**: Monitor your selected stocks over time
- **Export Data**: Save results for external analysis

## 🔧 Configuration

### Data Sources
- **Primary**: Yahoo Finance (yfinance)
- **S&P 500 Reference**: SPY ETF
- **Update Frequency**: Real-time during market hours

### Performance Settings
- **Max Workers**: Auto-configured based on CPU cores
- **Rate Limiting**: Built-in delays to respect API limits
- **Batch Size**: Optimized for reliability and speed

## 📁 Project Structure

```
stock-hunter-pro/
├── app.py                 # Flask backend server
├── index.html            # Frontend interface
├── requirements.txt      # Python dependencies
├── utils/
│   ├── __init__.py
│   ├── data_fetcher.py   # yFinance data handler
│   ├── minervini_criteria.py # 8-point analysis
│   ├── rs_calculator.py  # RS Rating computation
│   └── file_handler.py   # Local storage management
└── data/
    ├── sample_stocks.csv # Sample data
    └── watchlist_history.json # Watch list storage
```

## 🎛️ API Endpoints

### Core Endpoints
- `GET /` - Serve main interface
- `GET /health` - System health check
- `POST /api/analyze` - Run stock analysis
- `GET /api/sample-data` - Get sample stocks

### Watch List Management
- `GET /api/watchlist` - Get watch list
- `POST /api/watchlist` - Add to watch list  
- `DELETE /api/watchlist` - Remove from watch list

## 🔍 Example Analysis

**Input**: AVGO (Broadcom Inc.)

**Results**:
- **RS Rating**: 83 (Strong)
- **Criteria Passed**: 7/7 ✅
- **Price**: $1,400 (above all MAs)
- **From 52W Low**: +75% 
- **From 52W High**: -6.5%
- **Status**: ✅ **WATCHLIST CANDIDATE**

## 🚀 Advanced Features

### Batch Processing
```python
# Analyze large datasets
symbols = ["AAPL", "MSFT", "GOOGL", ...]  # 100+ stocks
results = api.analyze_stock_batch(symbols)
```

### Custom Filtering
```python
# Filter for high-RS stocks
high_rs_stocks = [r for r in results if r['rs_rating'] >= 80]
```

### Export Options
- **CSV Export**: Full results with metadata
- **Watch List Export**: Selected stocks only
- **Historical Tracking**: Performance over time

## ⚠️ Important Notes

### Data Accuracy
- Market data provided by Yahoo Finance
- RS Ratings calculated using IBD methodology
- Results are for educational purposes only

### Rate Limiting
- Built-in delays respect API limits
- Large datasets processed in batches
- Automatic retry logic for failed requests

### Performance
- Optimized for 50-100 stocks per analysis
- Parallel processing for speed
- Caching to minimize redundant requests

## 🛠️ Development

### Running in Development Mode
```bash
export FLASK_ENV=development
python app.py
```

### Testing
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest tests/

# Run with coverage
pytest --cov=utils tests/
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mark Minervini** - For the proven trend template methodology
- **William O'Neil** - For the RS Rating concept and IBD research
- **Yahoo Finance** - For providing market data access

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**⚡ Happy Stock Hunting! ⚡**

*Built with ❤️ for serious stock analysis*