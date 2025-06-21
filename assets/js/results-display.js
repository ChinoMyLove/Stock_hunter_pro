/**
 * Stock Hunter Pro - Results Display Module
 * 📊 Handle analysis results display and interaction
 */

import { addLogEntry, formatNumber, formatPercentage, formatCurrency, downloadCSV } from './utils.js';

export class ResultsDisplay {
    constructor() {
        this.currentResults = [];
        this.filteredResults = [];
        this.sortColumn = 'rs_rating';
        this.sortDirection = 'desc';
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 50,
            totalItems: 0
        };
    }

    /**
     * Build results table structure
     */
    buildResultsTable() {
        const contentBody = document.getElementById('content-body');
        if (!contentBody) return;

        // Create results table container
        const resultsTableHTML = `
            <!-- Filter Bar -->
            <div class="filter-bar" id="filterBar" style="display: none; grid-column: 1 / -1;">
                <div class="filter-group">
                    <label class="filter-label">Status:</label>
                    <select class="filter-select" id="statusFilter" data-filter="status">
                        <option value="all">All Stocks</option>
                        <option value="passed">Passed Only</option>
                        <option value="failed">Failed Only</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">RS Rating:</label>
                    <select class="filter-select" id="rsFilter" data-filter="rsRating">
                        <option value="all">All Ratings</option>
                        <option value="high">≥ 80 (High)</option>
                        <option value="good">≥ 70 (Good)</option>
                        <option value="average">50-69 (Average)</option>
                        <option value="low">< 50 (Low)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Sort By:</label>
                    <select class="filter-select" id="sortFilter" data-filter="sortBy">
                        <option value="rs_desc">RS Rating (High to Low)</option>
                        <option value="rs_asc">RS Rating (Low to High)</option>
                        <option value="symbol_asc">Symbol (A to Z)</option>
                        <option value="price_desc">Price (High to Low)</option>
                        <option value="volume_desc">Volume (High to Low)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <button class="nav-btn" onclick="resultsDisplay.resetFilters()">🔄 Reset</button>
                </div>
            </div>

            <!-- Results Table -->
            <div class="results-table" id="resultsTable" style="display: none; grid-column: 1 / -1;">
                <div class="table-header">
                    <div class="table-title" id="tableTitle">Analysis Results</div>
                    <div class="table-actions">
                        <button class="nav-btn" data-action="export-results">💾 Export CSV</button>
                        <button class="nav-btn" onclick="resultsDisplay.addAllPassedToWatch()">⭐ Add All Passed</button>
                        <button class="nav-btn" onclick="resultsDisplay.toggleFilters()">🔍 Filters</button>
                    </div>
                </div>
                
                <!-- Search Bar -->
                <div class="search-bar">
                    <input type="text" id="searchInput" placeholder="Search by symbol or company name..." class="search-input">
                    <button class="search-btn" onclick="resultsDisplay.performSearch()">🔍</button>
                </div>
                
                <!-- Table Container -->
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th data-sort="symbol">Symbol <span class="sort-indicator"></span></th>
                                <th data-sort="passed">Status <span class="sort-indicator"></span></th>
                                <th data-sort="rs_rating">RS Rating <span class="sort-indicator">↓</span></th>
                                <th data-sort="price">Price <span class="sort-indicator"></span></th>
                                <th data-sort="ma50">50MA <span class="sort-indicator"></span></th>
                                <th data-sort="ma150">150MA <span class="sort-indicator"></span></th>
                                <th data-sort="ma200">200MA <span class="sort-indicator"></span></th>
                                <th>52W High</th>
                                <th>52W Low</th>
                                <th data-sort="from_low_pct">From Low % <span class="sort-indicator"></span></th>
                                <th data-sort="from_high_pct">From High % <span class="sort-indicator"></span></th>
                                <th>200MA Trend</th>
                                <th data-sort="volume">Volume <span class="sort-indicator"></span></th>
                                <th>Score</th>
                                <th>Issues</th>
                                <th>Watch</th>
                            </tr>
                        </thead>
                        <tbody id="resultsTableBody">
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="pagination" id="pagination" style="display: none;">
                    <div class="pagination-info">
                        <span id="paginationInfo">Showing 0 of 0 results</span>
                    </div>
                    <div class="pagination-controls">
                        <button class="nav-btn" id="prevPageBtn" onclick="resultsDisplay.previousPage()" disabled>← Previous</button>
                        <span id="pageNumbers"></span>
                        <button class="nav-btn" id="nextPageBtn" onclick="resultsDisplay.nextPage()" disabled>Next →</button>
                    </div>
                </div>
            </div>
        `;

        // Add results table to content body
        contentBody.insertAdjacentHTML('beforeend', resultsTableHTML);

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for table interactions
     */
    setupEventListeners() {
        // Filter changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-filter]')) {
                this.applyFilters();
            }
        });

        // Table header sorting
        document.addEventListener('click', (e) => {
            if (e.target.matches('th[data-sort]')) {
                const column = e.target.getAttribute('data-sort');
                this.sortBy(column);
            }
        });

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch();
                }, 300);
            });
        }
    }

    /**
     * Display analysis results
     * @param {Array} results - Analysis results
     */
    displayResults(results) {
        try {
            console.log('🎯 Displaying results:', results);
            
            this.currentResults = results || [];
            this.filteredResults = [...this.currentResults];
            
            if (this.currentResults.length === 0) {
                addLogEntry('warning', '⚠️ No results to display');
                return;
            }

            // Show table and filter bar
            this.showResultsTable();
            
            // Apply initial sorting
            this.sortResults();
            
            // Render table
            this.renderTable();
            
            // Update pagination
            this.updatePagination();
            
            // Update table title
            this.updateTableTitle();
            
            addLogEntry('success', `✅ Displayed ${this.currentResults.length} results`);
            
        } catch (error) {
            addLogEntry('error', `❌ Error displaying results: ${error.message}`);
            console.error('Display error:', error);
        }
    }

    /**
     * Show results table and filter bar
     */
    showResultsTable() {
        const resultsTable = document.getElementById('resultsTable');
        const filterBar = document.getElementById('filterBar');
        
        if (resultsTable) {
            resultsTable.style.display = 'block';
        }
        
        if (filterBar) {
            filterBar.style.display = 'flex';
        }
    }

    /**
     * Render table rows
     */
    renderTable() {
        const tableBody = document.getElementById('resultsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        // Calculate pagination
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const endIndex = Math.min(startIndex + this.pagination.itemsPerPage, this.filteredResults.length);
        const pageResults = this.filteredResults.slice(startIndex, endIndex);

        if (pageResults.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="16" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        No results match the current filters
                    </td>
                </tr>
            `;
            return;
        }

        // Create rows
        pageResults.forEach(result => {
            const row = this.createResultRow(result);
            tableBody.appendChild(row);
        });

        console.log(`Rendered ${pageResults.length} rows for page ${this.pagination.currentPage}`);
    }

    /**
     * Create a single result row
     * @param {Object} result - Analysis result
     * @returns {HTMLElement} Table row element
     */
    createResultRow(result) {
        const row = document.createElement('tr');
        row.className = `result-row ${result.passed ? 'passed' : 'failed'}`;
        
        if (result.error) {
            row.innerHTML = `
                <td class="symbol-cell">${result.symbol}</td>
                <td class="status-cell"><span class="status-indicator status-error">ERROR</span></td>
                <td colspan="14" class="error-cell">Error: ${result.error}</td>
            `;
            return row;
        }

        // Extract metrics safely
        const metrics = result.metrics || {};
        const isWatched = this.isInWatchList(result.symbol);
        
        // Format values
        const price = this.formatValue(metrics.price, 'currency');
        const ma50 = this.formatValue(metrics.ma50, 'currency');
        const ma150 = this.formatValue(metrics.ma150, 'currency');
        const ma200 = this.formatValue(metrics.ma200, 'currency');
        const week52High = this.formatValue(metrics.week_52_high, 'currency');
        const week52Low = this.formatValue(metrics.week_52_low, 'currency');
        const fromLowPct = this.formatValue(metrics.from_low_pct, 'percentage');
        const fromHighPct = this.formatValue(metrics.from_high_pct, 'percentage');
        const volume = this.formatValue(metrics.volume, 'number');
        const rsRating = result.rs_rating || 0;
        const score = result.score || 0;
        const maxScore = result.max_score || 7;

        // Format fail reasons
        const failReasons = result.passed 
            ? '<span class="success-text">✅ All criteria passed</span>'
            : `<span class="fail-text">${(result.fail_reasons || []).join(', ')}</span>`;

        row.innerHTML = `
            <td class="symbol-cell">
                <span class="symbol-text">${result.symbol}</span>
            </td>
            <td class="status-cell">
                <span class="status-indicator ${result.passed ? 'status-pass' : 'status-fail'}">
                    ${result.passed ? 'PASS' : 'FAIL'}
                </span>
            </td>
            <td class="rs-rating-cell">
                <div class="rs-rating ${this.getRsRatingClass(rsRating)}">
                    <span class="rs-value">${rsRating}</span>
                    <span class="rs-bar">
                        <span class="rs-fill" style="width: ${rsRating}%"></span>
                    </span>
                </div>
            </td>
            <td class="price-cell">${price}</td>
            <td class="ma-cell">${ma50}</td>
            <td class="ma-cell">${ma150}</td>
            <td class="ma-cell">${ma200}</td>
            <td class="price-cell">${week52High}</td>
            <td class="price-cell">${week52Low}</td>
            <td class="percentage-cell ${this.getPercentageClass(metrics.from_low_pct, 30, true)}">
                ${fromLowPct}
            </td>
            <td class="percentage-cell ${this.getPercentageClass(Math.abs(metrics.from_high_pct || 0), 25, false)}">
                ${fromHighPct}
            </td>
            <td class="trend-cell">
                <span class="trend-indicator ${metrics.ma200_trending_up ? 'trend-up' : 'trend-down'}">
                    ${metrics.ma200_trending_up ? '↗ UP' : '↘ DOWN'}
                </span>
            </td>
            <td class="volume-cell">${volume}</td>
            <td class="score-cell">
                <span class="score-fraction">${score}/${maxScore}</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${(score/maxScore)*100}%"></div>
                </div>
            </td>
            <td class="issues-cell">
                ${failReasons}
            </td>
            <td class="watch-cell">
                <button class="watch-btn ${isWatched ? 'watched' : ''}" 
                        data-symbol="${result.symbol}"
                        data-action="add-to-watch"
                        title="${isWatched ? 'Remove from watch list' : 'Add to watch list'}">
                    ⭐
                </button>
            </td>
        `;

        return row;
    }

    /**
     * Format value based on type
     * @param {any} value - Value to format
     * @param {string} type - Format type
     * @returns {string} Formatted value
     */
    formatValue(value, type) {
        if (value === undefined || value === null || value === '') {
            return 'N/A';
        }

        switch (type) {
            case 'currency':
                return formatCurrency(Number(value));
            case 'percentage':
                return formatPercentage(Number(value));
            case 'number':
                return formatNumber(Number(value));
            default:
                return String(value);
        }
    }

    /**
     * Get RS rating CSS class
     * @param {number} rating - RS rating
     * @returns {string} CSS class
     */
    getRsRatingClass(rating) {
        if (rating >= 90) return 'rs-exceptional';
        if (rating >= 80) return 'rs-strong';
        if (rating >= 70) return 'rs-good';
        if (rating >= 50) return 'rs-average';
        return 'rs-weak';
    }

    /**
     * Get percentage cell CSS class
     * @param {number} value - Percentage value
     * @param {number} threshold - Threshold value
     * @param {boolean} higherIsBetter - Whether higher values are better
     * @returns {string} CSS class
     */
    getPercentageClass(value, threshold, higherIsBetter) {
        if (value === undefined || value === null) return 'neutral';
        
        const meetsThreshold = higherIsBetter ? value >= threshold : value <= threshold;
        return meetsThreshold ? 'positive' : 'negative';
    }

    /**
     * Sort results by column
     * @param {string} column - Column to sort by
     */
    sortBy(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }

        this.sortResults();
        this.updateSortIndicators();
        this.renderTable();
        
        addLogEntry('info', `🔄 Sorted by ${column} (${this.sortDirection})`);
    }

    /**
     * Sort results array
     */
    sortResults() {
        this.filteredResults.sort((a, b) => {
            let aVal, bVal;

            switch (this.sortColumn) {
                case 'symbol':
                    aVal = a.symbol || '';
                    bVal = b.symbol || '';
                    break;
                case 'passed':
                    aVal = a.passed ? 1 : 0;
                    bVal = b.passed ? 1 : 0;
                    break;
                case 'rs_rating':
                    aVal = a.rs_rating || 0;
                    bVal = b.rs_rating || 0;
                    break;
                case 'price':
                    aVal = a.metrics?.price || 0;
                    bVal = b.metrics?.price || 0;
                    break;
                case 'volume':
                    aVal = a.metrics?.volume || 0;
                    bVal = b.metrics?.volume || 0;
                    break;
                default:
                    return 0;
            }

            if (typeof aVal === 'string') {
                return this.sortDirection === 'asc' 
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            } else {
                return this.sortDirection === 'asc' 
                    ? aVal - bVal
                    : bVal - aVal;
            }
        });
    }

    /**
     * Update sort indicators in table headers
     */
    updateSortIndicators() {
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '';
        });

        const currentHeader = document.querySelector(`th[data-sort="${this.sortColumn}"] .sort-indicator`);
        if (currentHeader) {
            currentHeader.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
        }
    }

    /**
     * Apply filters to results
     */
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        const rsFilter = document.getElementById('rsFilter')?.value || 'all';
        const sortFilter = document.getElementById('sortFilter')?.value || 'rs_desc';

        // Apply status filter
        let filtered = [...this.currentResults];
        
        if (statusFilter === 'passed') {
            filtered = filtered.filter(r => r.passed && !r.error);
        } else if (statusFilter === 'failed') {
            filtered = filtered.filter(r => !r.passed || r.error);
        }

        // Apply RS rating filter
        if (rsFilter !== 'all') {
            switch (rsFilter) {
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

        // Apply sort
        const [sortCol, sortDir] = sortFilter.split('_');
        this.sortColumn = sortCol;
        this.sortDirection = sortDir;

        this.filteredResults = filtered;
        this.pagination.currentPage = 1; // Reset to first page
        
        this.sortResults();
        this.renderTable();
        this.updatePagination();
        this.updateTableTitle();

        addLogEntry('info', `🔍 Applied filters: ${filtered.length}/${this.currentResults.length} results`);
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('rsFilter').value = 'all';
        document.getElementById('sortFilter').value = 'rs_desc';
        document.getElementById('searchInput').value = '';

        this.applyFilters();
        addLogEntry('info', '🔄 Filters reset');
    }

    /**
     * Perform search
     */
    performSearch() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        
        if (!searchTerm) {
            this.applyFilters();
            return;
        }

        this.filteredResults = this.currentResults.filter(result => {
            const symbol = (result.symbol || '').toLowerCase();
            const companyName = (result.metrics?.company_name || '').toLowerCase();
            
            return symbol.includes(searchTerm) || companyName.includes(searchTerm);
        });

        this.pagination.currentPage = 1;
        this.renderTable();
        this.updatePagination();
        this.updateTableTitle();

        addLogEntry('info', `🔍 Search results: ${this.filteredResults.length} matches for "${searchTerm}"`);
    }

    /**
     * Toggle filters visibility
     */
    toggleFilters() {
        const filterBar = document.getElementById('filterBar');
        if (filterBar) {
            const isVisible = filterBar.style.display !== 'none';
            filterBar.style.display = isVisible ? 'none' : 'flex';
        }
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        this.pagination.totalItems = this.filteredResults.length;
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);

        // Update pagination info
        const paginationInfo = document.getElementById('paginationInfo');
        if (paginationInfo) {
            const startItem = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1;
            const endItem = Math.min(this.pagination.currentPage * this.pagination.itemsPerPage, this.pagination.totalItems);
            paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${this.pagination.totalItems} results`;
        }

        // Update buttons
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        
        if (prevBtn) prevBtn.disabled = this.pagination.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.pagination.currentPage >= totalPages;

        // Show/hide pagination
        const pagination = document.getElementById('pagination');
        if (pagination) {
            pagination.style.display = totalPages > 1 ? 'flex' : 'none';
        }
    }

    /**
     * Update table title
     */
    updateTableTitle() {
        const tableTitle = document.getElementById('tableTitle');
        if (tableTitle) {
            const passedCount = this.filteredResults.filter(r => r.passed && !r.error).length;
            tableTitle.textContent = `Analysis Results (${this.filteredResults.length} stocks, ${passedCount} passed)`;
        }
    }

    /**
     * Go to previous page
     */
    previousPage() {
        if (this.pagination.currentPage > 1) {
            this.pagination.currentPage--;
            this.renderTable();
            this.updatePagination();
        }
    }

    /**
     * Go to next page
     */
    nextPage() {
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
        if (this.pagination.currentPage < totalPages) {
            this.pagination.currentPage++;
            this.renderTable();
            this.updatePagination();
        }
    }

    /**
     * Export results to CSV
     * @param {Array} results - Results to export (optional)
     */
    exportResults(results = null) {
        const dataToExport = results || this.filteredResults;
        
        if (!dataToExport || dataToExport.length === 0) {
            addLogEntry('warning', '⚠️ No results to export');
            return;
        }

        const exportData = dataToExport.map(result => ({
            Symbol: result.symbol || '',
            Status: result.passed ? 'PASS' : 'FAIL',
            'RS Rating': result.rs_rating || 0,
            Price: result.metrics?.price || '',
            '50MA': result.metrics?.ma50 || '',
            '150MA': result.metrics?.ma150 || '',
            '200MA': result.metrics?.ma200 || '',
            '52W High': result.metrics?.week_52_high || '',
            '52W Low': result.metrics?.week_52_low || '',
            'From High %': result.metrics?.from_high_pct || '',
            'From Low %': result.metrics?.from_low_pct || '',
            '200MA Trend': result.metrics?.ma200_trending_up ? 'UP' : 'DOWN',
            Volume: result.metrics?.volume || '',
            Score: `${result.score || 0}/${result.max_score || 7}`,
            'Fail Reasons': (result.fail_reasons || []).join('; ')
        }));

        const filename = `stock_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
        downloadCSV(exportData, filename);
    }

    /**
     * Add all passed stocks to watch list
     */
    addAllPassedToWatch() {
        const passedStocks = this.filteredResults.filter(r => r.passed && !r.error);
        
        if (passedStocks.length === 0) {
            addLogEntry('warning', '⚠️ No passed stocks to add to watch list');
            return;
        }

        // This will be handled by the watch list module
        const event = new CustomEvent('addMultipleToWatch', {
            detail: { stocks: passedStocks }
        });
        document.dispatchEvent(event);
    }

    /**
     * Clear results display
     */
    clearResults() {
        this.currentResults = [];
        this.filteredResults = [];
        
        const resultsTable = document.getElementById('resultsTable');
        const filterBar = document.getElementById('filterBar');
        
        if (resultsTable) resultsTable.style.display = 'none';
        if (filterBar) filterBar.style.display = 'none';
        
        addLogEntry('info', '🗑️ Results display cleared');
    }

    /**
     * Check if stock is in watch list
     * @param {string} symbol - Stock symbol
     * @returns {boolean} Is in watch list
     */
    isInWatchList(symbol) {
        // This will be updated when watch list module is integrated
        return false;
    }
}