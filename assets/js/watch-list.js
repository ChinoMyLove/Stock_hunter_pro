/**
 * Stock Hunter Pro - Watch List Module
 * ⭐ Manage user's stock watch list
 */

import { Storage, addLogEntry, showNotification, downloadCSV, formatCurrency, formatPercentage } from './utils.js';

export class WatchList {
    constructor() {
        this.watchedStocks = [];
        this.maxWatchListSize = 100;
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for watch list events
        document.addEventListener('addMultipleToWatch', (e) => {
            this.addMultiple(e.detail.stocks);
        });

        // Listen for individual stock watch toggles
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="add-to-watch"]')) {
                const symbol = e.target.getAttribute('data-symbol');
                if (symbol) {
                    this.toggle(symbol);
                }
            }
        });
    }

    /**
     * Load watch list from storage
     */
    loadFromStorage() {
        try {
            this.watchedStocks = Storage.get('watchList', []);
            this.updateUI();
            addLogEntry('info', `⭐ Loaded ${this.watchedStocks.length} stocks from watch list`);
        } catch (error) {
            addLogEntry('warning', `⚠️ Error loading watch list: ${error.message}`);
            this.watchedStocks = [];
        }
    }

    /**
     * Save watch list to storage
     */
    saveToStorage() {
        try {
            Storage.set('watchList', this.watchedStocks);
        } catch (error) {
            addLogEntry('warning', `⚠️ Error saving watch list: ${error.message}`);
        }
    }

    /**
     * Add stock to watch list
     * @param {string|Object} stockOrSymbol - Stock symbol or stock object
     * @param {Object} analysisResult - Analysis result data (optional)
     */
    add(stockOrSymbol, analysisResult = null) {
        let symbol, stockData;

        if (typeof stockOrSymbol === 'string') {
            symbol = stockOrSymbol;
            stockData = {
                symbol: symbol,
                addedAt: new Date().toISOString(),
                analysisResult: analysisResult
            };
        } else {
            symbol = stockOrSymbol.symbol;
            stockData = {
                symbol: symbol,
                addedAt: new Date().toISOString(),
                analysisResult: stockOrSymbol
            };
        }

        // Check if already exists
        if (this.exists(symbol)) {
            addLogEntry('info', `📋 ${symbol} is already in watch list`);
            return false;
        }

        // Check size limit
        if (this.watchedStocks.length >= this.maxWatchListSize) {
            addLogEntry('warning', `⚠️ Watch list is full (${this.maxWatchListSize} stocks max)`);
            showNotification(`Watch list is full (${this.maxWatchListSize} max)`, 'warning');
            return false;
        }

        // Add to list
        this.watchedStocks.push(stockData);
        this.saveToStorage();
        this.updateUI();

        addLogEntry('success', `⭐ Added ${symbol} to watch list`);
        showNotification(`Added ${symbol} to watch list`, 'success');
        return true;
    }

    /**
     * Remove stock from watch list
     * @param {string} symbol - Stock symbol to remove
     */
    remove(symbol) {
        const initialLength = this.watchedStocks.length;
        this.watchedStocks = this.watchedStocks.filter(stock => stock.symbol !== symbol);

        if (this.watchedStocks.length < initialLength) {
            this.saveToStorage();
            this.updateUI();
            addLogEntry('info', `📋 Removed ${symbol} from watch list`);
            showNotification(`Removed ${symbol} from watch list`, 'info');
            return true;
        }

        return false;
    }

    /**
     * Toggle stock in watch list
     * @param {string} symbol - Stock symbol
     * @param {Object} analysisResult - Analysis result (optional)
     */
    toggle(symbol, analysisResult = null) {
        if (this.exists(symbol)) {
            this.remove(symbol);
        } else {
            this.add(symbol, analysisResult);
        }
    }

    /**
     * Check if stock exists in watch list
     * @param {string} symbol - Stock symbol
     * @returns {boolean} Exists in watch list
     */
    exists(symbol) {
        return this.watchedStocks.some(stock => stock.symbol === symbol);
    }

    /**
     * Get watch list
     * @returns {Array} Watch list array
     */
    getAll() {
        return this.watchedStocks;
    }

    /**
     * Get watch list count
     * @returns {number} Number of watched stocks
     */
    getCount() {
        return this.watchedStocks.length;
    }

    /**
     * Add multiple stocks to watch list
     * @param {Array} stocks - Array of stock objects
     */
    addMultiple(stocks) {
        if (!Array.isArray(stocks) || stocks.length === 0) {
            addLogEntry('warning', '⚠️ No stocks provided for watch list');
            return;
        }

        let addedCount = 0;
        let skippedCount = 0;

        stocks.forEach(stock => {
            if (this.add(stock)) {
                addedCount++;
            } else {
                skippedCount++;
            }
        });

        if (addedCount > 0) {
            const message = `Added ${addedCount} stocks to watch list`;
            if (skippedCount > 0) {
                addLogEntry('info', `${message} (${skippedCount} already existed or skipped)`);
            } else {
                addLogEntry('success', `⭐ ${message}`);
            }
            showNotification(message, 'success');
        } else {
            addLogEntry('info', '📋 No new stocks added to watch list');
        }
    }

    /**
     * Clear all stocks from watch list
     */
    clear() {
        if (this.watchedStocks.length === 0) {
            addLogEntry('info', '📋 Watch list is already empty');
            return;
        }

        const count = this.watchedStocks.length;
        this.watchedStocks = [];
        this.saveToStorage();
        this.updateUI();

        addLogEntry('info', `🗑️ Cleared ${count} stocks from watch list`);
        showNotification('Watch list cleared', 'info');
    }

    /**
     * Sort watch list
     * @param {string} sortBy - Sort criteria (symbol, addedAt, rsRating, etc.)
     * @param {string} direction - Sort direction (asc, desc)
     */
    sort(sortBy = 'addedAt', direction = 'desc') {
        this.watchedStocks.sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
                case 'symbol':
                    aVal = a.symbol;
                    bVal = b.symbol;
                    break;
                case 'addedAt':
                    aVal = new Date(a.addedAt);
                    bVal = new Date(b.addedAt);
                    break;
                case 'rsRating':
                    aVal = a.analysisResult?.rs_rating || 0;
                    bVal = b.analysisResult?.rs_rating || 0;
                    break;
                case 'price':
                    aVal = a.analysisResult?.metrics?.price || 0;
                    bVal = b.analysisResult?.metrics?.price || 0;
                    break;
                default:
                    return 0;
            }

            if (typeof aVal === 'string') {
                return direction === 'asc' 
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            } else {
                return direction === 'asc' 
                    ? aVal - bVal
                    : bVal - aVal;
            }
        });

        this.saveToStorage();
        this.updateWatchListDisplay();
    }

    /**
     * Filter watch list
     * @param {string} filterBy - Filter criteria
     * @param {any} filterValue - Filter value
     * @returns {Array} Filtered watch list
     */
    filter(filterBy, filterValue) {
        return this.watchedStocks.filter(stock => {
            switch (filterBy) {
                case 'passed':
                    return stock.analysisResult?.passed === filterValue;
                case 'rsRating':
                    const rsRating = stock.analysisResult?.rs_rating || 0;
                    if (filterValue === 'high') return rsRating >= 80;
                    if (filterValue === 'good') return rsRating >= 70;
                    if (filterValue === 'average') return rsRating >= 50 && rsRating < 70;
                    if (filterValue === 'low') return rsRating < 50;
                    return true;
                case 'sector':
                    return stock.analysisResult?.metrics?.sector === filterValue;
                default:
                    return true;
            }
        });
    }

    /**
     * Search watch list
     * @param {string} query - Search query
     * @returns {Array} Search results
     */
    search(query) {
        if (!query || query.length < 1) {
            return this.watchedStocks;
        }

        const searchTerm = query.toLowerCase();
        return this.watchedStocks.filter(stock => {
            const symbol = stock.symbol.toLowerCase();
            const companyName = (stock.analysisResult?.metrics?.company_name || '').toLowerCase();
            
            return symbol.includes(searchTerm) || companyName.includes(searchTerm);
        });
    }

    /**
     * Export watch list
     * @param {string} format - Export format (csv, json)
     */
    export(format = 'csv') {
        if (this.watchedStocks.length === 0) {
            addLogEntry('warning', '⚠️ No stocks in watch list to export');
            showNotification('No stocks to export', 'warning');
            return;
        }

        const timestamp = new Date().toISOString().slice(0, 10);
        
        if (format === 'csv') {
            const exportData = this.watchedStocks.map(stock => ({
                Symbol: stock.symbol,
                'Added Date': new Date(stock.addedAt).toLocaleDateString(),
                Status: stock.analysisResult?.passed ? 'PASS' : 'FAIL',
                'RS Rating': stock.analysisResult?.rs_rating || 'N/A',
                Price: stock.analysisResult?.metrics?.price || 'N/A',
                '52W High': stock.analysisResult?.metrics?.week_52_high || 'N/A',
                '52W Low': stock.analysisResult?.metrics?.week_52_low || 'N/A',
                'From High %': stock.analysisResult?.metrics?.from_high_pct || 'N/A',
                'From Low %': stock.analysisResult?.metrics?.from_low_pct || 'N/A',
                'Fail Reasons': stock.analysisResult?.fail_reasons?.join('; ') || 'N/A'
            }));

            downloadCSV(exportData, `watchlist_${timestamp}.csv`);
        } else if (format === 'json') {
            const exportData = {
                exportDate: new Date().toISOString(),
                stockCount: this.watchedStocks.length,
                stocks: this.watchedStocks
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `watchlist_${timestamp}.json`;
            a.click();
            URL.revokeObjectURL(url);

            addLogEntry('success', `💾 Exported watch list to JSON`);
        }
    }

    /**
     * Import watch list
     * @param {File} file - File to import
     */
    async import(file) {
        try {
            const content = await this.readFile(file);
            let importData;

            if (file.name.endsWith('.json')) {
                importData = JSON.parse(content);
                if (importData.stocks) {
                    this.importFromArray(importData.stocks);
                }
            } else if (file.name.endsWith('.csv')) {
                // Simple CSV import - assumes first column is symbols
                const lines = content.split('\n').filter(line => line.trim());
                const symbols = lines.slice(1).map(line => {
                    const parts = line.split(',');
                    return parts[0]?.trim().replace(/"/g, '');
                }).filter(symbol => symbol);

                this.importFromSymbols(symbols);
            }

        } catch (error) {
            addLogEntry('error', `❌ Error importing watch list: ${error.message}`);
            showNotification('Import failed', 'error');
        }
    }

    /**
     * Import from array of stock objects
     * @param {Array} stocks - Array of stock objects
     */
    importFromArray(stocks) {
        if (!Array.isArray(stocks)) return;

        let importedCount = 0;
        stocks.forEach(stock => {
            if (stock.symbol && !this.exists(stock.symbol)) {
                this.watchedStocks.push({
                    symbol: stock.symbol,
                    addedAt: stock.addedAt || new Date().toISOString(),
                    analysisResult: stock.analysisResult || null
                });
                importedCount++;
            }
        });

        if (importedCount > 0) {
            this.saveToStorage();
            this.updateUI();
            addLogEntry('success', `📥 Imported ${importedCount} stocks to watch list`);
            showNotification(`Imported ${importedCount} stocks`, 'success');
        }
    }

    /**
     * Import from array of symbols
     * @param {Array} symbols - Array of stock symbols
     */
    importFromSymbols(symbols) {
        if (!Array.isArray(symbols)) return;

        let importedCount = 0;
        symbols.forEach(symbol => {
            if (symbol && !this.exists(symbol)) {
                this.watchedStocks.push({
                    symbol: symbol,
                    addedAt: new Date().toISOString(),
                    analysisResult: null
                });
                importedCount++;
            }
        });

        if (importedCount > 0) {
            this.saveToStorage();
            this.updateUI();
            addLogEntry('success', `📥 Imported ${importedCount} symbols to watch list`);
            showNotification(`Imported ${importedCount} symbols`, 'success');
        }
    }

    /**
     * Read file content
     * @param {File} file - File to read
     * @returns {Promise<string>} File content
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Update UI elements
     */
    updateUI() {
        this.updateWatchListCount();
        this.updateWatchButtons();
        this.updateWatchListDisplay();
    }

    /**
     * Update watch list count in UI
     */
    updateWatchListCount() {
        const countElement = document.getElementById('watchListCount');
        const statWatched = document.getElementById('statWatched');
        const statWatchedChange = document.getElementById('statWatchedChange');

        const count = this.watchedStocks.length;

        if (countElement) countElement.textContent = count;
        if (statWatched) statWatched.textContent = count;
        if (statWatchedChange) {
            statWatchedChange.textContent = count > 0 
                ? `${count} stocks tracked`
                : 'Add your first stock';
        }
    }

    /**
     * Update watch buttons in results table
     */
    updateWatchButtons() {
        document.querySelectorAll('.watch-btn').forEach(btn => {
            const symbol = btn.getAttribute('data-symbol');
            if (symbol) {
                const isWatched = this.exists(symbol);
                btn.classList.toggle('watched', isWatched);
                btn.title = isWatched ? 'Remove from watch list' : 'Add to watch list';
            }
        });
    }

    /**
     * Update watch list display when on watch list screen
     */
    updateWatchListDisplay() {
        const watchListContent = document.getElementById('watchListContent');
        if (!watchListContent) return;

        if (this.watchedStocks.length === 0) {
            watchListContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⭐</div>
                    <div class="empty-title">No stocks in watch list</div>
                    <div class="empty-text">Add stocks by running analysis and clicking the star button</div>
                    <button class="nav-btn primary" onclick="document.querySelector('[data-screen=\"trend-template\"]').click()">
                        🎯 Go to Analysis
                    </button>
                </div>
            `;
            return;
        }

        // Build watch list table
        watchListContent.innerHTML = `
            <div class="watch-list-controls">
                <div class="watch-list-filters">
                    <select id="watchSortBy" onchange="watchList.handleSortChange()">
                        <option value="addedAt_desc">Recently Added</option>
                        <option value="symbol_asc">Symbol (A-Z)</option>
                        <option value="rsRating_desc">RS Rating (High)</option>
                        <option value="price_desc">Price (High)</option>
                    </select>
                    <input type="text" id="watchSearch" placeholder="Search symbols..." 
                           oninput="watchList.handleSearch()" class="search-input">
                </div>
                <div class="watch-list-actions">
                    <button class="nav-btn" onclick="watchList.export('csv')">💾 Export CSV</button>
                    <button class="nav-btn" onclick="watchList.clear()">🗑️ Clear All</button>
                </div>
            </div>
            
            <div class="watch-list-table">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Added</th>
                            <th>Status</th>
                            <th>RS Rating</th>
                            <th>Price</th>
                            <th>From High</th>
                            <th>From Low</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="watchListTableBody">
                        ${this.renderWatchListRows()}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Render watch list table rows
     * @returns {string} HTML for table rows
     */
    renderWatchListRows() {
        return this.watchedStocks.map(stock => {
            const result = stock.analysisResult;
            const addedDate = new Date(stock.addedAt).toLocaleDateString();
            
            return `
                <tr class="watch-list-row">
                    <td class="symbol-cell">
                        <span class="symbol-text">${stock.symbol}</span>
                    </td>
                    <td class="date-cell">${addedDate}</td>
                    <td class="status-cell">
                        ${result ? 
                            `<span class="status-indicator ${result.passed ? 'status-pass' : 'status-fail'}">
                                ${result.passed ? 'PASS' : 'FAIL'}
                            </span>` : 
                            '<span class="status-unknown">N/A</span>'
                        }
                    </td>
                    <td class="rs-rating-cell">
                        ${result?.rs_rating || 'N/A'}
                    </td>
                    <td class="price-cell">
                        ${result?.metrics?.price ? formatCurrency(result.metrics.price) : 'N/A'}
                    </td>
                    <td class="percentage-cell">
                        ${result?.metrics?.from_high_pct ? formatPercentage(result.metrics.from_high_pct) : 'N/A'}
                    </td>
                    <td class="percentage-cell">
                        ${result?.metrics?.from_low_pct ? formatPercentage(result.metrics.from_low_pct) : 'N/A'}
                    </td>
                    <td class="actions-cell">
                        <button class="action-btn remove-btn" 
                                onclick="watchList.remove('${stock.symbol}')"
                                title="Remove from watch list">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Handle sort change from UI
     */
    handleSortChange() {
        const sortSelect = document.getElementById('watchSortBy');
        if (sortSelect) {
            const [sortBy, direction] = sortSelect.value.split('_');
            this.sort(sortBy, direction);
        }
    }

    /**
     * Handle search from UI
     */
    handleSearch() {
        const searchInput = document.getElementById('watchSearch');
        if (searchInput) {
            const query = searchInput.value;
            const filtered = this.search(query);
            
            const tableBody = document.getElementById('watchListTableBody');
            if (tableBody) {
                if (filtered.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">
                                No stocks match your search
                            </td>
                        </tr>
                    `;
                } else {
                    // Temporarily update displayed stocks
                    const originalStocks = this.watchedStocks;
                    this.watchedStocks = filtered;
                    tableBody.innerHTML = this.renderWatchListRows();
                    this.watchedStocks = originalStocks;
                }
            }
        }
    }

    /**
     * Get statistics about watch list
     * @returns {Object} Watch list statistics
     */
    getStatistics() {
        const total = this.watchedStocks.length;
        const withAnalysis = this.watchedStocks.filter(s => s.analysisResult).length;
        const passed = this.watchedStocks.filter(s => s.analysisResult?.passed).length;
        const highRS = this.watchedStocks.filter(s => (s.analysisResult?.rs_rating || 0) >= 70).length;

        return {
            total,
            withAnalysis,
            passed,
            highRS,
            passRate: withAnalysis > 0 ? (passed / withAnalysis * 100) : 0
        };
    }
}