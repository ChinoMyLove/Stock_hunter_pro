/**
 * Stock Hunter Pro - Data Manager Module
 * 💾 Centralized data management and state handling
 */

import { Storage, addLogEntry } from './utils.js';

export class DataManager {
    constructor() {
        this.stockData = [];
        this.analysisResults = [];
        this.filters = {
            status: 'all',
            rsRating: 'all',
            sortBy: 'rs_desc'
        };
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 50,
            totalItems: 0
        };
    }

    /**
     * Set stock data
     * @param {Array} data - Array of stock data objects
     */
    setStockData(data) {
        this.stockData = Array.isArray(data) ? data : [];
        this.saveToStorage('stockData', this.stockData);
        addLogEntry('info', `📊 Stock data updated: ${this.stockData.length} symbols`);
    }

    /**
     * Get stock data
     * @returns {Array} Stock data array
     */
    getStockData() {
        return this.stockData;
    }

    /**
     * Add single stock to data
     * @param {Object} stock - Stock object
     */
    addStock(stock) {
        if (!stock || !stock.symbol) return;
        
        // Check if already exists
        const exists = this.stockData.some(s => s.symbol === stock.symbol);
        if (!exists) {
            this.stockData.push(stock);
            this.saveToStorage('stockData', this.stockData);
            addLogEntry('info', `➕ Added ${stock.symbol} to stock data`);
        }
    }

    /**
     * Remove stock from data
     * @param {string} symbol - Stock symbol to remove
     */
    removeStock(symbol) {
        const initialLength = this.stockData.length;
        this.stockData = this.stockData.filter(s => s.symbol !== symbol);
        
        if (this.stockData.length < initialLength) {
            this.saveToStorage('stockData', this.stockData);
            addLogEntry('info', `➖ Removed ${symbol} from stock data`);
        }
    }

    /**
     * Set analysis results
     * @param {Array} results - Analysis results array
     */
    setAnalysisResults(results) {
        this.analysisResults = Array.isArray(results) ? results : [];
        this.saveToStorage('analysisResults', this.analysisResults);
        this.pagination.totalItems = this.analysisResults.length;
        addLogEntry('info', `📈 Analysis results updated: ${this.analysisResults.length} results`);
    }

    /**
     * Get analysis results
     * @returns {Array} Analysis results array
     */
    getAnalysisResults() {
        return this.analysisResults;
    }

    /**
     * Get filtered and sorted results
     * @returns {Array} Filtered results
     */
    getFilteredResults() {
        let filtered = [...this.analysisResults];

        // Apply status filter
        if (this.filters.status === 'passed') {
            filtered = filtered.filter(r => r.passed && !r.error);
        } else if (this.filters.status === 'failed') {
            filtered = filtered.filter(r => !r.passed || r.error);
        }

        // Apply RS rating filter
        if (this.filters.rsRating !== 'all') {
            switch (this.filters.rsRating) {
                case 'high':
                    filtered = filtered.filter(r => (r.rs_rating || 0) >= 80);
                    break;
                case 'good':
                    filtered = filtered.filter(r => (r.rs_rating || 0) >= 70);
                    break;
                case 'average':
                    filtered = filtered.filter(r => (r.rs_rating || 0) >= 50 && (r.rs_rating || 0) < 70);
                    break;
                case 'low':
                    filtered = filtered.filter(r => (r.rs_rating || 0) < 50);
                    break;
            }
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'rs_desc':
                    return (b.rs_rating || 0) - (a.rs_rating || 0);
                case 'rs_asc':
                    return (a.rs_rating || 0) - (b.rs_rating || 0);
                case 'symbol_asc':
                    return a.symbol.localeCompare(b.symbol);
                case 'price_desc':
                    return (b.metrics?.price || 0) - (a.metrics?.price || 0);
                case 'volume_desc':
                    return (b.metrics?.volume || 0) - (a.metrics?.volume || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }

    /**
     * Get paginated results
     * @returns {Object} Paginated results with metadata
     */
    getPaginatedResults() {
        const filtered = this.getFilteredResults();
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const endIndex = startIndex + this.pagination.itemsPerPage;
        const items = filtered.slice(startIndex, endIndex);

        return {
            items,
            pagination: {
                currentPage: this.pagination.currentPage,
                itemsPerPage: this.pagination.itemsPerPage,
                totalItems: filtered.length,
                totalPages: Math.ceil(filtered.length / this.pagination.itemsPerPage),
                hasNext: endIndex < filtered.length,
                hasPrev: this.pagination.currentPage > 1
            }
        };
    }

    /**
     * Set filters
     * @param {Object} newFilters - Filter settings
     */
    setFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.pagination.currentPage = 1; // Reset to first page
        this.saveToStorage('filters', this.filters);
        addLogEntry('info', `🔍 Filters updated: ${JSON.stringify(newFilters)}`);
    }

    /**
     * Get current filters
     * @returns {Object} Current filter settings
     */
    getFilters() {
        return this.filters;
    }

    /**
     * Set pagination
     * @param {Object} paginationSettings - Pagination settings
     */
    setPagination(paginationSettings) {
        this.pagination = { ...this.pagination, ...paginationSettings };
        this.saveToStorage('pagination', this.pagination);
    }

    /**
     * Get pagination settings
     * @returns {Object} Pagination settings
     */
    getPagination() {
        return this.pagination;
    }

    /**
     * Go to specific page
     * @param {number} page - Page number
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.getFilteredResults().length / this.pagination.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.pagination.currentPage = page;
            this.saveToStorage('pagination', this.pagination);
        }
    }

    /**
     * Get statistics summary
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const results = this.analysisResults;
        
        if (!results || results.length === 0) {
            return {
                total: 0,
                passed: 0,
                failed: 0,
                successRate: 0,
                avgRsRating: 0,
                highRsCount: 0,
                errors: 0
            };
        }

        const passed = results.filter(r => r.passed && !r.error);
        const failed = results.filter(r => !r.passed || r.error);
        const errors = results.filter(r => r.error);
        const rsRatings = results.filter(r => !r.error).map(r => r.rs_rating || 0);
        const highRs = results.filter(r => (r.rs_rating || 0) >= 70);

        return {
            total: results.length,
            passed: passed.length,
            failed: failed.length,
            successRate: results.length > 0 ? (passed.length / results.length * 100) : 0,
            avgRsRating: rsRatings.length > 0 ? rsRatings.reduce((a, b) => a + b, 0) / rsRatings.length : 0,
            highRsCount: highRs.length,
            errors: errors.length
        };
    }

    /**
     * Get top performers
     * @param {number} limit - Number of top performers to return
     * @returns {Array} Top performing stocks
     */
    getTopPerformers(limit = 10) {
        return this.analysisResults
            .filter(r => r.passed && !r.error)
            .sort((a, b) => (b.rs_rating || 0) - (a.rs_rating || 0))
            .slice(0, limit);
    }

    /**
     * Search stocks by symbol or name
     * @param {string} query - Search query
     * @returns {Array} Matching results
     */
    searchStocks(query) {
        if (!query || query.length < 1) {
            return this.getFilteredResults();
        }

        const searchTerm = query.toLowerCase();
        return this.analysisResults.filter(stock => {
            const symbol = stock.symbol?.toLowerCase() || '';
            const companyName = stock.metrics?.company_name?.toLowerCase() || '';
            
            return symbol.includes(searchTerm) || companyName.includes(searchTerm);
        });
    }

    /**
     * Export data to various formats
     * @param {string} format - Export format ('csv', 'json')
     * @param {Array} data - Data to export (optional, defaults to analysis results)
     * @returns {Object} Export data
     */
    exportData(format = 'csv', data = null) {
        const exportData = data || this.getFilteredResults();
        
        if (format === 'csv') {
            return this.exportToCSV(exportData);
        } else if (format === 'json') {
            return this.exportToJSON(exportData);
        }
        
        throw new Error(`Unsupported export format: ${format}`);
    }

    /**
     * Export to CSV format
     * @param {Array} data - Data to export
     * @returns {Object} CSV export data
     */
    exportToCSV(data) {
        const headers = [
            'Symbol', 'Status', 'RS Rating', 'Price', '50MA', '150MA', '200MA',
            '52W High', '52W Low', 'From High %', 'From Low %', '200MA Trend',
            'Volume', 'Score', 'Fail Reasons'
        ];

        const rows = data.map(result => [
            result.symbol || '',
            result.passed ? 'PASS' : 'FAIL',
            result.rs_rating || 0,
            result.metrics?.price || '',
            result.metrics?.ma50 || '',
            result.metrics?.ma150 || '',
            result.metrics?.ma200 || '',
            result.metrics?.week_52_high || '',
            result.metrics?.week_52_low || '',
            result.metrics?.from_high_pct || '',
            result.metrics?.from_low_pct || '',
            result.metrics?.ma200_trending_up ? 'UP' : 'DOWN',
            result.metrics?.volume || '',
            result.score || 0,
            (result.fail_reasons || []).join('; ')
        ]);

        return {
            headers,
            rows,
            csvContent: [headers, ...rows].map(row => row.join(',')).join('\n')
        };
    }

    /**
     * Export to JSON format
     * @param {Array} data - Data to export
     * @returns {Object} JSON export data
     */
    exportToJSON(data) {
        return {
            exportDate: new Date().toISOString(),
            totalRecords: data.length,
            filters: this.filters,
            statistics: this.getStatistics(),
            data: data
        };
    }

    /**
     * Clear all data
     */
    clearAll() {
        this.stockData = [];
        this.analysisResults = [];
        this.filters = {
            status: 'all',
            rsRating: 'all',
            sortBy: 'rs_desc'
        };
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 50,
            totalItems: 0
        };

        // Clear from storage
        this.removeFromStorage('stockData');
        this.removeFromStorage('analysisResults');
        this.removeFromStorage('filters');
        this.removeFromStorage('pagination');

        addLogEntry('info', '🗑️ All data cleared from memory and storage');
    }

    /**
     * Load data from storage
     */
    loadFromStorage() {
        try {
            this.stockData = Storage.get('stockData', []);
            this.analysisResults = Storage.get('analysisResults', []);
            this.filters = Storage.get('filters', {
                status: 'all',
                rsRating: 'all',
                sortBy: 'rs_desc'
            });
            this.pagination = Storage.get('pagination', {
                currentPage: 1,
                itemsPerPage: 50,
                totalItems: 0
            });

            addLogEntry('info', `💾 Loaded data from storage: ${this.stockData.length} stocks, ${this.analysisResults.length} results`);
        } catch (error) {
            addLogEntry('warning', `⚠️ Error loading from storage: ${error.message}`);
        }
    }

    /**
     * Save data to storage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     */
    saveToStorage(key, data) {
        try {
            Storage.set(key, data);
        } catch (error) {
            addLogEntry('warning', `⚠️ Error saving to storage: ${error.message}`);
        }
    }

    /**
     * Remove data from storage
     * @param {string} key - Storage key
     */
    removeFromStorage(key) {
        try {
            Storage.remove(key);
        } catch (error) {
            addLogEntry('warning', `⚠️ Error removing from storage: ${error.message}`);
        }
    }

    /**
     * Get data size in storage
     * @returns {Object} Storage size information
     */
    getStorageSize() {
        try {
            const stockDataSize = JSON.stringify(this.stockData).length;
            const resultsSize = JSON.stringify(this.analysisResults).length;
            const totalSize = stockDataSize + resultsSize;

            return {
                stockData: this.formatBytes(stockDataSize),
                analysisResults: this.formatBytes(resultsSize),
                total: this.formatBytes(totalSize),
                totalBytes: totalSize
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Format bytes to human readable string
     * @param {number} bytes - Bytes to format
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Validate data integrity
     * @returns {Object} Validation results
     */
    validateData() {
        const issues = [];
        
        // Check stock data
        this.stockData.forEach((stock, index) => {
            if (!stock.symbol) {
                issues.push(`Stock at index ${index} missing symbol`);
            }
        });

        // Check analysis results
        this.analysisResults.forEach((result, index) => {
            if (!result.symbol) {
                issues.push(`Result at index ${index} missing symbol`);
            }
            if (typeof result.passed !== 'boolean') {
                issues.push(`Result ${result.symbol} has invalid 'passed' value`);
            }
        });

        return {
            isValid: issues.length === 0,
            issues,
            stockDataCount: this.stockData.length,
            resultsCount: this.analysisResults.length
        };
    }
}