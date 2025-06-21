/**
 * Stock Hunter Pro - CSV Parser Module
 * 🔧 Intelligent CSV parsing with smart ticker column detection
 */

import { addLogEntry, normalizeSymbol } from './utils.js';

export class CSVParser {
    constructor() {
        this.supportedFormats = ['.csv', '.xlsx', '.xls', '.tsv'];
        this.tickerPatterns = [
            'ticker', 'symbol', 'stock', 'sym', 'code', 'stock symbol', 'equity'
        ];
    }

    /**
     * Parse CSV file and extract stock tickers
     * @param {File} file - CSV file
     * @returns {Promise<Array>} Array of stock data
     */
    async parseFile(file) {
        try {
            if (!this.isValidFile(file)) {
                throw new Error('Invalid file format. Please use CSV, Excel, or TSV files.');
            }

            addLogEntry('info', `📁 Loading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
            
            const content = await this.readFileContent(file);
            const result = this.parseCSVContent(content, file.name);
            
            return result;
            
        } catch (error) {
            addLogEntry('error', `❌ Error parsing file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate file format
     */
    isValidFile(file) {
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        return this.supportedFormats.includes(extension);
    }

    /**
     * Read file content
     */
    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Parse CSV content with intelligent ticker detection
     */
    parseCSVContent(csvContent, fileName) {
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            throw new Error('CSV file appears to be empty or has insufficient data');
        }

        // Parse headers
        const headers = this.parseCSVLine(lines[0]);
        console.log('📊 CSV Headers detected:', headers);
        addLogEntry('info', `📊 Headers: ${headers.join(', ')}`);

        // 🎯 Smart ticker column detection
        const tickerColumn = this.detectTickerColumn(headers, lines);
        
        if (tickerColumn.index === -1) {
            throw new Error(`Could not identify ticker column. Available columns: ${headers.join(', ')}`);
        }

        addLogEntry('success', `✅ Found ticker column: "${tickerColumn.name}" (column ${tickerColumn.index + 1})`);

        // Extract tickers
        const stockData = this.extractTickers(lines, tickerColumn.index, headers);
        
        if (stockData.length === 0) {
            throw new Error('No valid ticker symbols found. Please ensure your CSV contains actual stock tickers (AAPL, MSFT, etc.)');
        }

        // Show preview
        const preview = stockData.slice(0, 5).map(s => s.symbol).join(', ');
        addLogEntry('info', `📋 Sample tickers: ${preview}${stockData.length > 5 ? '...' : ''}`);
        addLogEntry('success', `✅ Loaded ${stockData.length} valid ticker symbols`);

        return {
            stockData,
            fileName,
            totalRows: lines.length - 1,
            columnName: tickerColumn.name
        };
    }

    /**
     * Intelligent ticker column detection
     */
    detectTickerColumn(headers, lines) {
        let tickerIndex = -1;
        let tickerName = '';

        // Priority 1: Exact match with ticker patterns
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i].toLowerCase().trim();
            if (this.tickerPatterns.includes(header)) {
                tickerIndex = i;
                tickerName = headers[i];
                addLogEntry('success', `🎯 Exact match found: "${tickerName}"`);
                break;
            }
        }

        // Priority 2: Partial match with patterns
        if (tickerIndex === -1) {
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i].toLowerCase().trim();
                for (const pattern of this.tickerPatterns) {
                    if (header.includes(pattern)) {
                        tickerIndex = i;
                        tickerName = headers[i];
                        addLogEntry('info', `📊 Pattern match: "${tickerName}" contains "${pattern}"`);
                        break;
                    }
                }
                if (tickerIndex !== -1) break;
            }
        }

        // Priority 3: Analyze data patterns
        if (tickerIndex === -1) {
            addLogEntry('warning', '⚠️ No obvious ticker column found, analyzing data patterns...');
            
            const columnScores = this.analyzeDataPatterns(headers, lines);
            const maxScore = Math.max(...columnScores);
            
            if (maxScore > 0) {
                tickerIndex = columnScores.indexOf(maxScore);
                tickerName = headers[tickerIndex];
                addLogEntry('info', `🤖 Auto-detected: "${tickerName}" (score: ${maxScore})`);
            }
        }

        return { index: tickerIndex, name: tickerName };
    }

    /**
     * Analyze data patterns to find ticker-like columns
     */
    analyzeDataPatterns(headers, lines) {
        const columnScores = new Array(headers.length).fill(0);
        const sampleRows = lines.slice(1, Math.min(6, lines.length));

        sampleRows.forEach(line => {
            const values = this.parseCSVLine(line);
            values.forEach((value, idx) => {
                const cleanValue = value.trim().replace(/^"|"$/g, '').toUpperCase();
                
                // Perfect ticker pattern: 1-5 uppercase letters
                if (/^[A-Z]{1,5}$/.test(cleanValue)) {
                    columnScores[idx] += 10;
                }
                // Good ticker pattern: 1-10 chars, letters/numbers/dots/hyphens, no spaces
                else if (/^[A-Z0-9\-\.]{1,10}$/.test(cleanValue) && !cleanValue.includes(' ')) {
                    columnScores[idx] += 5;
                }
                // Possible ticker: short alphanumeric
                else if (/^[A-Z0-9]{1,8}$/.test(cleanValue)) {
                    columnScores[idx] += 2;
                }
                // Penalty for company names (contains spaces or long text)
                else if (cleanValue.includes(' ') || cleanValue.length > 10) {
                    columnScores[idx] -= 2;
                }
            });
        });

        // Log analysis results
        columnScores.forEach((score, idx) => {
            if (score > 0) {
                addLogEntry('info', `📊 "${headers[idx]}": ticker score = ${score}`);
            }
        });

        return columnScores;
    }

    /**
     * Extract and validate tickers from CSV
     */
    extractTickers(lines, tickerIndex, headers) {
        const stockData = [];
        let validCount = 0;
        let skippedCount = 0;

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            
            if (values.length <= tickerIndex || !values[tickerIndex]) {
                skippedCount++;
                continue;
            }

            const rawSymbol = values[tickerIndex].trim().replace(/^"|"$/g, '');
            
            // Skip empty or invalid
            if (!rawSymbol || rawSymbol.length < 1 || rawSymbol.length > 10) {
                skippedCount++;
                continue;
            }

            // Check if it looks like a company name (contains spaces, too long)
            if (rawSymbol.includes(' ') || (rawSymbol.length > 5 && !rawSymbol.includes('.') && !rawSymbol.includes('-'))) {
                addLogEntry('warning', `⚠️ "${rawSymbol}" looks like a company name, not a ticker`);
                skippedCount++;
                continue;
            }

            // Validate ticker format
            const symbol = rawSymbol.toUpperCase();
            if (!/^[A-Z0-9\-\.]+$/.test(symbol)) {
                skippedCount++;
                continue;
            }

            // Normalize and add
            const normalizedSymbol = normalizeSymbol(symbol);
            if (normalizedSymbol && !stockData.some(s => s.symbol === normalizedSymbol)) {
                stockData.push({
                    symbol: normalizedSymbol,
                    rawData: values,
                    rowIndex: i,
                    additionalData: this.extractAdditionalData(values, headers)
                });
                validCount++;
            } else {
                skippedCount++;
            }
        }

        // Log results
        if (skippedCount > 0) {
            addLogEntry('warning', `⚠️ Skipped ${skippedCount} invalid entries`);
        }

        return stockData;
    }

    /**
     * Extract additional data from CSV (market cap, price, etc.)
     */
    extractAdditionalData(values, headers) {
        const additionalData = {};
        
        // Common financial data columns
        const dataColumns = {
            'market cap': 'marketCap',
            'price': 'price',
            'last close': 'price',
            'volume': 'volume',
            '52 week high': 'week52High',
            '52 week low': 'week52Low'
        };

        headers.forEach((header, index) => {
            const lowerHeader = header.toLowerCase().trim();
            const key = dataColumns[lowerHeader];
            
            if (key && values[index]) {
                const value = values[index].trim().replace(/^"|"$/g, '');
                
                // Try to parse as number
                const numValue = parseFloat(value.replace(/[,$]/g, ''));
                if (!isNaN(numValue)) {
                    additionalData[key] = numValue;
                } else {
                    additionalData[key] = value;
                }
            }
        });

        return additionalData;
    }

    /**
     * Parse CSV line properly (handles quotes and commas)
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    /**
     * Create sample CSV for testing
     */
    static createSampleCSV() {
        const sampleData = `Company Name,Ticker,Last Close,Market Cap (mil),52 Week High,52 Week Low
Apple Inc,AAPL,175.25,2800000,198.23,124.17
Microsoft Corp,MSFT,335.50,2500000,348.10,213.43
Alphabet Inc,GOOGL,125.75,1600000,151.55,83.34
Amazon.com Inc,AMZN,145.80,1500000,188.11,81.43
Tesla Inc,TSLA,185.60,590000,414.50,101.81
Meta Platforms Inc,META,315.25,800000,531.49,88.09
NVIDIA Corp,NVDA,875.45,2200000,950.02,108.13
Netflix Inc,NFLX,485.30,215000,700.99,162.71`;

        const blob = new Blob([sampleData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_stocks.csv';
        a.click();
        URL.revokeObjectURL(url);
        
        addLogEntry('info', '📥 Downloaded sample CSV file');
    }
}