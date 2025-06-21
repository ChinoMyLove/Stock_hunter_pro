/**
 * Stock Hunter Pro - Main Application Module
 * 🚀 Modular application controller
 */

import { addLogEntry, showLoading, hideLoading, showNotification, normalizeSymbol } from './utils.js';
import { apiClient } from './api-client.js';
import { CSVParser } from './csv-parser.js';
import { UIComponents } from './ui-components.js';
import { DataManager } from './data-manager.js';
import { ResultsDisplay } from './results-display.js';
import { WatchList } from './watch-list.js';

class StockHunterApp {
    constructor() {
        this.csvParser = new CSVParser();
        this.uiComponents = new UIComponents();
        this.dataManager = new DataManager();
        this.resultsDisplay = new ResultsDisplay();
        this.watchList = new WatchList();
        
        this.isAnalyzing = false;
        this.currentScreen = 'trend-template';
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            addLogEntry('info', '🚀 Initializing Stock Hunter Pro v2.0...');
            
            // Build UI components
            await this.buildUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load watch list from storage
            this.watchList.loadFromStorage();
            
            // Test backend connection
            setTimeout(() => this.testBackend(), 1000);
            
            // Initialize with default screen
            this.switchScreen('trend-template');
            
            addLogEntry('success', '✅ Stock Hunter Pro v2.0 initialized successfully');
            
        } catch (error) {
            addLogEntry('error', `❌ Initialization failed: ${error.message}`);
            console.error('Initialization error:', error);
        }
    }

    /**
     * Build UI components
     */
    async buildUI() {
        // Build navigation
        this.uiComponents.buildNavigation();
        
        // Build sidebar
        this.uiComponents.buildSidebar();
        
        // Build main content areas
        this.uiComponents.buildContentHeader();
        this.uiComponents.buildStatsCards();
        this.uiComponents.buildMainPanels();
        
        // Build results table (initially hidden)
        this.resultsDisplay.buildResultsTable();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation events
        document.addEventListener('click', this.handleNavigation.bind(this));
        
        // File upload events
        this.setupFileUpload();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    /**
     * Handle navigation clicks
     */
    handleNavigation(event) {
        const target = event.target;
        
        // Screen navigation
        if (target.matches('[data-screen]')) {
            const screenName = target.getAttribute('data-screen');
            this.switchScreen(screenName);
            return;
        }
        
        // Button actions
        const action = target.getAttribute('data-action');
        if (action) {
            this.handleAction(action, target);
        }
    }

    /**
     * Handle button actions
     */
    async handleAction(action, button) {
        try {
            switch (action) {
                case 'test-backend':
                    await this.testBackend();
                    break;
                    
                case 'load-sample':
                    await this.loadSampleData();
                    break;
                    
                case 'start-analysis':
                    await this.startAnalysis();
                    break;
                    
                case 'stop-analysis':
                    await this.stopAnalysis();
                    break;
                    
                case 'import-csv':
                    this.importCSV();
                    break;
                    
                case 'manual-entry':
                    this.showManualEntry();
                    break;
                    
                case 'clear-data':
                    this.clearData();
                    break;
                    
                case 'export-results':
                    this.exportResults();
                    break;
                    
                case 'clear-log':
                    this.clearLog();
                    break;
                    
                case 'add-to-watch':
                    const symbol = button.getAttribute('data-symbol');
                    this.watchList.toggle(symbol);
                    break;
                    
                default:
                    addLogEntry('warning', `Unknown action: ${action}`);
            }
        } catch (error) {
            addLogEntry('error', `Action failed: ${error.message}`);
        }
    }

    /**
     * Switch between screens
     */
    switchScreen(screenName) {
        // Update navigation
        document.querySelectorAll('[data-screen]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-screen="${screenName}"]`)?.classList.add('active');

        // Update content
        this.currentScreen = screenName;
        this.uiComponents.updateScreenContent(screenName);
        
        addLogEntry('info', `📱 Switched to ${screenName} screen`);
    }

    /**
     * Test backend connection
     */
    async testBackend() {
        const connected = await apiClient.testConnection();
        
        if (connected) {
            showNotification('Backend connected successfully!', 'success');
        } else {
            showNotification('Backend connection failed. Please start the server.', 'error');
        }
        
        return connected;
    }

    /**
     * Load sample data
     */
    async loadSampleData() {
        try {
            addLogEntry('info', '🧪 Loading sample data...');
            
            const symbols = await apiClient.getSampleData();
            
            const stockData = symbols.map(symbol => ({
                symbol: normalizeSymbol(symbol),
                rawData: [symbol]
            }));
            
            this.dataManager.setStockData(stockData);
            this.updateFileInfo('Sample Data', stockData.length, 'Backend Sample');
            this.updateRunButton();
            
            addLogEntry('success', `🧪 Loaded ${stockData.length} sample stocks`);
            showNotification(`Loaded ${stockData.length} sample stocks`, 'success');
            
        } catch (error) {
            addLogEntry('error', `❌ Failed to load sample data: ${error.message}`);
            showNotification('Failed to load sample data', 'error');
        }
    }

    /**
     * Start stock analysis
     */
    async startAnalysis() {
        if (this.isAnalyzing) {
            addLogEntry('warning', '⚠️ Analysis already in progress...');
            return;
        }
        
        const stockData = this.dataManager.getStockData();
        if (!stockData || stockData.length === 0) {
            addLogEntry('error', '❌ No stock data loaded. Please import a file or load sample data.');
            showNotification('No stock data available', 'error');
            return;
        }
        
        try {
            this.isAnalyzing = true;
            this.updateAnalysisUI(true);
            
            const symbols = stockData.map(item => item.symbol);
            addLogEntry('info', `🎯 Starting analysis for ${symbols.length} symbols`);
            
            showLoading(`Analyzing ${symbols.length} stocks...`);
            
            // Use batch processing for large datasets
            const results = await apiClient.analyzeBatch(symbols, 1000, this.updateProgress.bind(this));
            
            if (results && results.results && results.results.length > 0) {
                this.dataManager.setAnalysisResults(results.results);
                this.resultsDisplay.displayResults(results.results);
                this.uiComponents.updateStats(results);
                
                addLogEntry('success', `✅ Analysis complete! ${results.results.length} stocks processed`);
                showNotification(`Analysis complete! ${results.summary.passed_criteria} stocks passed criteria`, 'success');
            } else {
                throw new Error('No valid results received');
            }
            
        } catch (error) {
            addLogEntry('error', `❌ Analysis failed: ${error.message}`);
            showNotification('Analysis failed', 'error');
        } finally {
            this.isAnalyzing = false;
            this.updateAnalysisUI(false);
            hideLoading();
        }
    }

    /**
     * Stop ongoing analysis
     */
    async stopAnalysis() {
        if (!this.isAnalyzing) return;
        
        try {
            await apiClient.stopAnalysis();
            this.isAnalyzing = false;
            this.updateAnalysisUI(false);
            hideLoading();
            
            showNotification('Analysis stopped', 'warning');
        } catch (error) {
            addLogEntry('error', `❌ Error stopping analysis: ${error.message}`);
        }
    }

    /**
     * Update analysis UI state
     */
    updateAnalysisUI(analyzing) {
        const runBtn = document.querySelector('[data-action="start-analysis"]');
        const stopBtn = document.querySelector('[data-action="stop-analysis"]');
        
        if (runBtn) {
            if (analyzing) {
                runBtn.innerHTML = '⏹️ Stop Analysis';
                runBtn.setAttribute('data-action', 'stop-analysis');
            } else {
                const stockData = this.dataManager.getStockData();
                const count = stockData ? stockData.length : 0;
                runBtn.innerHTML = count > 0 ? `🚀 Analyze ${count} Stocks` : '🚀 Start Analysis';
                runBtn.setAttribute('data-action', 'start-analysis');
                runBtn.disabled = count === 0;
            }
        }
    }

    /**
     * Update progress during batch analysis
     */
    updateProgress(progress, current, total) {
        const progressText = `Processing batch ${current}/${total} (${Math.round(progress)}%)`;
        
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = progressText;
        }
        
        addLogEntry('info', `📊 ${progressText}`);
    }

    /**
     * Setup file upload
     */
    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        // Click to upload
        uploadArea.addEventListener('click', () => {
            this.importCSV();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    /**
     * Import CSV file
     */
    importCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls,.tsv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        };
        input.click();
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(file) {
        try {
            const result = await this.csvParser.parseFile(file);
            
            this.dataManager.setStockData(result.stockData);
            this.updateFileInfo(result.fileName, result.stockData.length, result.columnName);
            this.updateRunButton();
            
            showNotification(`Loaded ${result.stockData.length} stocks from ${result.fileName}`, 'success');
            
        } catch (error) {
            addLogEntry('error', `❌ File upload failed: ${error.message}`);
            showNotification('File upload failed', 'error');
        }
    }

    /**
     * Show manual entry dialog
     */
    showManualEntry() {
        const symbols = prompt('Enter stock symbols separated by commas:\n\nExample: AAPL, MSFT, GOOGL, AMZN, TSLA');
        
        if (symbols) {
            const symbolList = symbols.split(',')
                .map(s => normalizeSymbol(s.trim()))
                .filter(s => s);
            
            if (symbolList.length > 0) {
                const stockData = symbolList.map(symbol => ({
                    symbol: symbol,
                    rawData: [symbol]
                }));
                
                this.dataManager.setStockData(stockData);
                this.updateFileInfo('Manual Entry', symbolList.length, 'Manual Input');
                this.updateRunButton();
                
                addLogEntry('success', `✅ Added ${symbolList.length} symbols manually`);
                showNotification(`Added ${symbolList.length} symbols`, 'success');
            } else {
                addLogEntry('error', '❌ No valid symbols entered');
                showNotification('No valid symbols entered', 'error');
            }
        }
    }

    /**
     * Clear all data
     */
    clearData() {
        this.dataManager.clearAll();
        this.resultsDisplay.clearResults();
        this.uiComponents.hideFileInfo();
        this.updateRunButton();
        
        addLogEntry('info', '🗑️ All data cleared');
        showNotification('Data cleared', 'info');
    }

    /**
     * Export results
     */
    exportResults() {
        const results = this.dataManager.getAnalysisResults();
        if (!results || results.length === 0) {
            addLogEntry('warning', '⚠️ No results to export');
            showNotification('No results to export', 'warning');
            return;
        }
        
        this.resultsDisplay.exportResults(results);
    }

    /**
     * Clear log
     */
    clearLog() {
        const logPanel = document.getElementById('logPanel');
        if (logPanel) {
            logPanel.innerHTML = '';
            addLogEntry('info', '🗑️ Log cleared');
        }
    }

    /**
     * Update file info display
     */
    updateFileInfo(fileName, count, columnName) {
        this.uiComponents.updateFileInfo(fileName, count, columnName);
    }

    /**
     * Update run button state
     */
    updateRunButton() {
        const stockData = this.dataManager.getStockData();
        const runBtn = document.querySelector('[data-action="start-analysis"]');
        
        if (runBtn) {
            if (stockData && stockData.length > 0) {
                runBtn.disabled = false;
                runBtn.innerHTML = `🚀 Analyze ${stockData.length} Stocks`;
            } else {
                runBtn.disabled = true;
                runBtn.innerHTML = '🚀 Start Analysis';
            }
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(event) {
        // Ctrl+Enter: Start analysis
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            if (!this.isAnalyzing) {
                this.startAnalysis();
            }
        }
        
        // Escape: Stop analysis
        if (event.key === 'Escape' && this.isAnalyzing) {
            this.stopAnalysis();
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        if (this.isAnalyzing) {
            event.preventDefault();
            event.returnValue = 'Analysis is in progress. Are you sure you want to leave?';
            return event.returnValue;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StockHunterApp();
});