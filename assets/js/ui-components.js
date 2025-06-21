/**
 * Stock Hunter Pro - UI Components Module
 * 🎨 Build and manage user interface components
 */

export class UIComponents {
    constructor() {
        this.screens = {
            'trend-template': {
                title: 'Trend Template Analysis',
                description: 'Systematic stock selection using Minervini\'s proven 8-criteria framework'
            },
            'watch-list': {
                title: 'Watch List Management',
                description: 'Monitor and track your selected high-potential stocks'
            },
            'portfolio-analysis': {
                title: 'Portfolio Analysis',
                description: 'Comprehensive analysis of your investment portfolio'
            },
            'stock-screener': {
                title: 'Stock Screener',
                description: 'Advanced screening tools for stock discovery'
            }
        };
    }

    /**
     * Build top navigation
     */
    buildNavigation() {
        const navActions = document.getElementById('navActions');
        if (!navActions) return;

        navActions.innerHTML = `
            <button class="nav-btn" data-action="import-csv">
                📁 Import CSV
            </button>
            <button class="nav-btn" data-action="test-backend">
                🔍 Test Backend
            </button>
            <button class="nav-btn" data-action="load-sample">
                🧪 Load Sample
            </button>
            <button class="nav-btn primary" data-action="start-analysis" disabled>
                🚀 Run Analysis
            </button>
        `;
    }

    /**
     * Build sidebar navigation
     */
    buildSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        sidebar.innerHTML = `
            <!-- Sidebar Header -->
            <div class="sidebar-header">
                <div class="sidebar-title">Analysis Hub</div>
                <div class="sidebar-subtitle">Professional Stock Analysis Platform</div>
            </div>

            <!-- Core Analysis Tools -->
            <div class="sidebar-section">
                <div class="sidebar-section-title">Core Analysis Tools</div>
                <div class="nav-item active" data-screen="trend-template">
                    <span class="icon">🎯</span>
                    <span>Trend Template</span>
                </div>
                <div class="nav-item" data-screen="watch-list">
                    <span class="icon">⭐</span>
                    <span>Watch List</span>
                    <span class="badge" id="watchListCount">0</span>
                </div>
                <div class="nav-item" data-screen="portfolio-analysis">
                    <span class="icon">📊</span>
                    <span>Portfolio Analysis</span>
                    <span class="status">Soon</span>
                </div>
                <div class="nav-item" data-screen="stock-screener">
                    <span class="icon">🔍</span>
                    <span>Stock Screener</span>
                    <span class="status">Soon</span>
                </div>
            </div>

            <!-- Market Intelligence -->
            <div class="sidebar-section">
                <div class="sidebar-section-title">Market Intelligence</div>
                <div class="nav-item" data-screen="market-overview">
                    <span class="icon">📈</span>
                    <span>Market Overview</span>
                    <span class="status">Soon</span>
                </div>
                <div class="nav-item" data-screen="sector-analysis">
                    <span class="icon">🏢</span>
                    <span>Sector Analysis</span>
                    <span class="status">Soon</span>
                </div>
                <div class="nav-item" data-screen="economic-calendar">
                    <span class="icon">📅</span>
                    <span>Economic Calendar</span>
                    <span class="status">Soon</span>
                </div>
            </div>

            <!-- Advanced Tools -->
            <div class="sidebar-section">
                <div class="sidebar-section-title">Advanced Tools</div>
                <div class="nav-item" data-screen="backtesting">
                    <span class="icon">⚡</span>
                    <span>Backtesting</span>
                    <span class="status">Soon</span>
                </div>
                <div class="nav-item" data-screen="ai-insights">
                    <span class="icon">🤖</span>
                    <span>AI Insights</span>
                    <span class="status">Soon</span>
                </div>
                <div class="nav-item" data-screen="settings">
                    <span class="icon">⚙️</span>
                    <span>Settings</span>
                </div>
            </div>

            <!-- Minervini Criteria -->
            <div class="sidebar-section">
                <div class="sidebar-section-title">Minervini Criteria</div>
                <div style="padding: 0 20px;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">
                        8-Point Trend Template
                    </div>
                    <div class="criteria-list">
                        <div class="criteria-item required">
                            <span class="criteria-text">1. Price > 50MA & 200MA</span>
                            <span class="criteria-status">✓ REQ</span>
                        </div>
                        <div class="criteria-item required">
                            <span class="criteria-text">2. 150MA > 200MA</span>
                            <span class="criteria-status">✓ REQ</span>
                        </div>
                        <div class="criteria-item required">
                            <span class="criteria-text">3. 200MA trending up</span>
                            <span class="criteria-status">✓ REQ</span>
                        </div>
                        <div class="criteria-item required">
                            <span class="criteria-text">4. 50MA > other MAs</span>
                            <span class="criteria-status">✓ REQ</span>
                        </div>
                        <div class="criteria-item required">
                            <span class="criteria-text">5. Price > 30% above 52W low</span>
                            <span class="criteria-status">✓ REQ</span>
                        </div>
                        <div class="criteria-item required">
                            <span class="criteria-text">6. Within 25% of 52W high</span>
                            <span class="criteria-status">✓ REQ</span>
                        </div>
                        <div class="criteria-item required">
                            <span class="criteria-text">7. Within 25% of 52W high</span>
                            <span class="criteria-status">✓ REQ</span>
                        </div>
                        <div class="criteria-item required">
                            <span class="criteria-text">8. RS Rating ≥ 70</span>
                            <span class="criteria-status">✓ REQ</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Build content header
     */
    buildContentHeader() {
        const contentHeader = document.getElementById('content-header');
        if (!contentHeader) return;

        contentHeader.innerHTML = `
            <div class="page-info">
                <h1 id="pageTitle">Trend Template Analysis</h1>
                <p id="pageDescription">Systematic stock selection using Minervini's proven 8-criteria framework</p>
            </div>
            <div class="header-actions">
                <button class="nav-btn" data-action="clear-data">
                    🗑️ Clear
                </button>
                <button class="nav-btn" data-action="export-results" style="display: none;" id="exportBtn">
                    💾 Export
                </button>
            </div>
        `;
    }

    /**
     * Build stats cards
     */
    buildStatsCards() {
        const statsRow = document.getElementById('stats-row');
        if (!statsRow) return;

        statsRow.innerHTML = `
            <div class="stat-card">
                <div class="stat-value" id="statTotal">0</div>
                <div class="stat-label">Total Analyzed</div>
                <div class="stat-change" id="statTotalChange">Ready to analyze</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="statPassed">0</div>
                <div class="stat-label">Passed Criteria</div>
                <div class="stat-change" id="statPassedChange">Waiting for data</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="statRate">0%</div>
                <div class="stat-label">Success Rate</div>
                <div class="stat-change" id="statRateChange">No analysis yet</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="statWatched">0</div>
                <div class="stat-label">Watch Listed</div>
                <div class="stat-change" id="statWatchedChange">Add your first stock</div>
            </div>
        `;
    }

    /**
     * Build main panels
     */
    buildMainPanels() {
        const contentBody = document.getElementById('content-body');
        if (!contentBody) return;

        contentBody.innerHTML = `
            <!-- Data Configuration Panel -->
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">Data Source Configuration</div>
                    <div class="panel-actions">
                        <button class="nav-btn" data-action="clear-data">🗑️ Clear</button>
                        <button class="nav-btn" data-action="manual-entry">✏️ Manual Entry</button>
                    </div>
                </div>
                <div class="panel-body">
                    <!-- File Info Display -->
                    <div class="file-info" id="fileInfo" style="display: none;">
                        <div class="file-info-title" id="fileInfoTitle">📋 File Loaded</div>
                        <div class="file-info-details" id="fileInfoDetails"></div>
                    </div>

                    <!-- Upload Area -->
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-icon">📊</div>
                        <div class="upload-text">Drop your stock list here or click to browse</div>
                        <div class="upload-hint">Supports CSV, Excel, TSV files • Smart ticker detection • No size limit</div>
                    </div>

                    <!-- Analysis Section -->
                    <div class="analysis-section" style="margin-top: 24px;">
                        <button class="analysis-btn" data-action="start-analysis" disabled>
                            🚀 Start Analysis
                        </button>
                    </div>
                </div>
            </div>

            <!-- System Log Panel -->
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">System Log</div>
                    <div class="panel-actions">
                        <button class="nav-btn" data-action="clear-log">🗑️ Clear Log</button>
                    </div>
                </div>
                <div class="panel-body">
                    <div class="log-panel" id="logPanel">
                        <div class="log-entry">
                            <span class="log-timestamp">[SYSTEM]</span>
                            <span class="log-info">🚀 Stock Hunter Pro v2.0 - Modular System Ready</span>
                        </div>
                        <div class="log-entry">
                            <span class="log-timestamp">[INFO]</span>
                            <span class="log-info">📡 Smart CSV parser with intelligent ticker detection</span>
                        </div>
                        <div class="log-entry">
                            <span class="log-timestamp">[INFO]</span>
                            <span class="log-info">⚡ Modular architecture - 10x faster development!</span>
                        </div>
                        <div class="log-entry">
                            <span class="log-timestamp">[INFO]</span>
                            <span class="log-info">🎯 Ready for professional stock analysis</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update screen content
     */
    updateScreenContent(screenName) {
        const screen = this.screens[screenName] || this.screens['trend-template'];
        
        const pageTitle = document.getElementById('pageTitle');
        const pageDescription = document.getElementById('pageDescription');
        
        if (pageTitle) pageTitle.textContent = screen.title;
        if (pageDescription) pageDescription.textContent = screen.description;
        
        // Show/hide panels based on screen
        this.updatePanelVisibility(screenName);
    }

    /**
     * Update panel visibility based on current screen
     */
    updatePanelVisibility(screenName) {
        const contentBody = document.getElementById('content-body');
        if (!contentBody) return;

        switch (screenName) {
            case 'trend-template':
                // Show analysis panels
                contentBody.style.display = 'grid';
                break;
                
            case 'watch-list':
                // Show watch list content
                this.buildWatchListContent();
                break;
                
            default:
                // Show coming soon message
                this.buildComingSoonContent(screenName);
        }
    }

    /**
     * Build watch list content
     */
    buildWatchListContent() {
        const contentBody = document.getElementById('content-body');
        if (!contentBody) return;

        contentBody.innerHTML = `
            <div class="panel" style="grid-column: 1 / -1;">
                <div class="panel-header">
                    <div class="panel-title">Your Watch List</div>
                    <div class="panel-actions">
                        <button class="nav-btn" data-action="clear-watchlist">🗑️ Clear All</button>
                        <button class="nav-btn" data-action="export-watchlist">💾 Export</button>
                    </div>
                </div>
                <div class="panel-body">
                    <div id="watchListContent">
                        <div class="empty-state">
                            <div class="empty-icon">⭐</div>
                            <div class="empty-title">No stocks in watch list</div>
                            <div class="empty-text">Add stocks by running analysis and clicking the star button</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Build coming soon content
     */
    buildComingSoonContent(screenName) {
        const contentBody = document.getElementById('content-body');
        if (!contentBody) return;

        const screen = this.screens[screenName] || { title: 'Coming Soon', description: 'This feature is under development' };

        contentBody.innerHTML = `
            <div class="panel" style="grid-column: 1 / -1;">
                <div class="panel-header">
                    <div class="panel-title">${screen.title}</div>
                </div>
                <div class="panel-body">
                    <div class="coming-soon">
                        <div class="coming-soon-icon">🚧</div>
                        <div class="coming-soon-title">Coming Soon</div>
                        <div class="coming-soon-text">${screen.description}</div>
                        <div class="coming-soon-features">
                            <h4>Planned Features:</h4>
                            <ul>
                                <li>Advanced filtering and sorting</li>
                                <li>Real-time data updates</li>
                                <li>Custom alerts and notifications</li>
                                <li>Export and sharing capabilities</li>
                                <li>Integration with external platforms</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update file info display
     */
    updateFileInfo(fileName, count, columnName) {
        const fileInfo = document.getElementById('fileInfo');
        const fileInfoTitle = document.getElementById('fileInfoTitle');
        const fileInfoDetails = document.getElementById('fileInfoDetails');
        
        if (fileInfo && fileInfoTitle && fileInfoDetails) {
            fileInfoTitle.textContent = `📋 ${columnName} Column Detected`;
            fileInfoDetails.textContent = `${fileName} • ${count} symbols loaded`;
            fileInfo.style.display = 'block';
        }
    }

    /**
     * Hide file info display
     */
    hideFileInfo() {
        const fileInfo = document.getElementById('fileInfo');
        if (fileInfo) {
            fileInfo.style.display = 'none';
        }
    }

    /**
     * Update stats display
     */
    updateStats(results) {
        if (!results || !results.summary) return;

        const summary = results.summary;
        
        // Update stat values
        const statTotal = document.getElementById('statTotal');
        const statPassed = document.getElementById('statPassed');
        const statRate = document.getElementById('statRate');
        
        if (statTotal) statTotal.textContent = summary.total_analyzed || 0;
        if (statPassed) statPassed.textContent = summary.passed_criteria || 0;
        if (statRate) {
            const rate = summary.total_analyzed > 0 
                ? ((summary.passed_criteria / summary.total_analyzed) * 100).toFixed(1)
                : 0;
            statRate.textContent = `${rate}%`;
        }

        // Update change indicators
        const statTotalChange = document.getElementById('statTotalChange');
        const statPassedChange = document.getElementById('statPassedChange');
        const statRateChange = document.getElementById('statRateChange');
        
        if (statTotalChange) statTotalChange.textContent = `${summary.total_analyzed} stocks analyzed`;
        if (statPassedChange) statPassedChange.textContent = `${summary.passed_criteria} met criteria`;
        if (statRateChange) {
            const rate = summary.total_analyzed > 0 
                ? ((summary.passed_criteria / summary.total_analyzed) * 100).toFixed(1)
                : 0;
            statRateChange.textContent = `${rate}% success rate`;
        }

        // Show export button if we have results
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn && summary.total_analyzed > 0) {
            exportBtn.style.display = 'block';
        }
    }

    /**
     * Update watch list count
     */
    updateWatchListCount(count) {
        const watchListCount = document.getElementById('watchListCount');
        const statWatched = document.getElementById('statWatched');
        
        if (watchListCount) watchListCount.textContent = count;
        if (statWatched) statWatched.textContent = count;
        
        const statWatchedChange = document.getElementById('statWatchedChange');
        if (statWatchedChange) {
            statWatchedChange.textContent = count > 0 
                ? `${count} stocks tracked`
                : 'Add your first stock';
        }
    }
}