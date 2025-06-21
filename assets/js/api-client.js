/**
 * Stock Hunter Pro - API Client Module
 * 🌐 Handle all backend communication
 */

import { CONFIG, addLogEntry, retry, showNotification } from './utils.js';

export class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.isConnected = false;
        this.retryCount = 3;
    }

    /**
     * Test backend connection
     * @returns {Promise<boolean>} Connection status
     */
    async testConnection() {
        try {
            addLogEntry('info', '🔄 Testing backend connection...');
            
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            this.isConnected = true;
            addLogEntry('success', '✅ Backend connection successful!');
            addLogEntry('info', `⚡ System info: Workers=${data.system_status?.max_workers || 'Unknown'}, Version=${data.version || 'Unknown'}`);
            
            // Update live indicator
            this.updateLiveIndicator(true);
            
            return true;
            
        } catch (error) {
            this.isConnected = false;
            addLogEntry('error', '❌ Backend connection failed!');
            addLogEntry('error', `📋 Error: ${error.message}`);
            
            if (error.message.includes('fetch')) {
                addLogEntry('info', '💡 Please ensure the backend is running: python app.py');
            }
            
            // Update live indicator
            this.updateLiveIndicator(false);
            
            return false;
        }
    }

    /**
     * Get sample stock data
     * @returns {Promise<Array>} Sample stock symbols
     */
    async getSampleData() {
        try {
            addLogEntry('info', '🧪 Loading sample data from backend...');
            
            const response = await fetch(`${this.baseURL}/sample-data`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.symbols && data.symbols.length > 0) {
                addLogEntry('success', `📊 Loaded ${data.symbols.length} sample stocks from backend`);
                return data.symbols;
            } else {
                throw new Error('No sample data available');
            }
            
        } catch (error) {
            addLogEntry('warning', '⚠️ Backend sample data failed, using local fallback');
            
            // Fallback to local sample data
            return [
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA',
                'NFLX', 'CRM', 'ADBE', 'AMD', 'QCOM', 'AVGO', 'ORCL', 
                'UBER', 'DIS', 'JPM', 'WMT'
            ];
        }
    }

    /**
     * Analyze stocks using backend
     * @param {Array} symbols - Array of stock symbols
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeStocks(symbols) {
        try {
            if (!symbols || symbols.length === 0) {
                throw new Error('No symbols provided for analysis');
            }

            // Test connection first
            const connected = await this.testConnection();
            if (!connected) {
                throw new Error('Backend not available');
            }

            addLogEntry('info', `📡 Sending request for ${symbols.length} symbols...`);
            console.log('🎯 Analyzing symbols:', symbols);

            const requestData = { symbols };
            
            const response = await retry(async () => {
                const res = await fetch(`${this.baseURL}/analyze`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP ${res.status}: ${errorText}`);
                }

                return res;
            }, this.retryCount);

            const data = await response.json();
            console.log('📊 Analysis response:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.results || !Array.isArray(data.results)) {
                throw new Error('Invalid response format from backend');
            }

            const summary = data.summary || {};
            addLogEntry('success', `✅ Analysis complete! ${summary.total_analyzed || data.results.length} stocks processed`);
            addLogEntry('info', `📈 Results: ${summary.passed_criteria || 0} passed criteria (${summary.success_rate || 0}% success rate)`);

            return {
                results: data.results,
                summary: summary,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            addLogEntry('error', `❌ Analysis failed: ${error.message}`);
            console.error('Analysis error:', error);
            throw error;
        }
    }

    /**
     * Stop ongoing analysis
     * @returns {Promise<boolean>} Success status
     */
    async stopAnalysis() {
        try {
            addLogEntry('warning', '⏹️ Stopping analysis...');
            
            const response = await fetch(`${this.baseURL}/stop-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                addLogEntry('warning', '⏹️ Analysis stopped by user');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            addLogEntry('error', `❌ Error stopping analysis: ${error.message}`);
            return false;
        }
    }

    /**
     * Update live indicator UI
     * @param {boolean} connected - Connection status
     */
    updateLiveIndicator(connected) {
        const indicator = document.getElementById('liveIndicator');
        if (!indicator) return;

        if (connected) {
            indicator.style.background = '#238636';
            indicator.textContent = '● LIVE DATA';
            indicator.classList.remove('offline');
        } else {
            indicator.style.background = '#f85149';
            indicator.textContent = '● OFFLINE';
            indicator.classList.add('offline');
        }
    }

    /**
     * Batch analysis for large datasets
     * @param {Array} symbols - Array of symbols
     * @param {number} batchSize - Batch size
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Array>} Combined results
     */
    async analyzeBatch(symbols, batchSize = CONFIG.MAX_SYMBOLS_PER_BATCH, progressCallback = null) {
        const batches = [];
        
        // Split into batches
        for (let i = 0; i < symbols.length; i += batchSize) {
            batches.push(symbols.slice(i, i + batchSize));
        }

        if (batches.length > 1) {
            addLogEntry('info', `📦 Processing ${symbols.length} symbols in ${batches.length} batches of ~${batchSize} each`);
        }

        const allResults = [];
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const batchNum = i + 1;
            
            try {
                addLogEntry('info', `📦 Processing batch ${batchNum}/${batches.length} (${batch.length} symbols)`);
                
                const batchResult = await this.analyzeStocks(batch);
                
                if (batchResult.results) {
                    allResults.push(...batchResult.results);
                }
                
                // Call progress callback
                if (progressCallback) {
                    const progress = (batchNum / batches.length) * 100;
                    progressCallback(progress, batchNum, batches.length);
                }
                
                addLogEntry('success', `✅ Batch ${batchNum} complete: ${batchResult.results?.length || 0} results`);
                
                // Small delay between batches to avoid overwhelming the server
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (error) {
                addLogEntry('error', `❌ Batch ${batchNum} failed: ${error.message}`);
                // Continue with next batch
            }
        }

        return {
            results: allResults,
            summary: {
                total_analyzed: allResults.length,
                passed_criteria: allResults.filter(r => r.passed && !r.error).length,
                batches_processed: batches.length
            }
        };
    }

    /**
     * Check if backend is available
     * @returns {boolean} Connection status
     */
    isBackendAvailable() {
        return this.isConnected;
    }

    /**
     * Get backend status
     * @returns {Promise<Object>} Backend status
     */
    async getStatus() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            return { status: 'offline', error: error.message };
        }
    }
}

// Create singleton instance
export const apiClient = new APIClient();