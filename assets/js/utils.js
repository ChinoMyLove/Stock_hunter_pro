/**
 * Stock Hunter Pro - Utilities Module
 * 🛠️ Common utility functions and helpers
 */

// Configuration
export const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    MAX_SYMBOLS_PER_BATCH: 1000,
    LOG_MAX_ENTRIES: 100
};

/**
 * Normalize stock symbol for Yahoo Finance
 * @param {string} symbol - Raw symbol
 * @returns {string} Normalized symbol
 */
export function normalizeSymbol(symbol) {
    if (!symbol) return '';
    
    // Just clean whitespace and convert to uppercase
    // Yahoo Finance handles dots in symbols correctly (e.g., BRK.A, BRK.B)
    return symbol.trim().toUpperCase();
}

/**
 * Add entry to system log
 * @param {string} type - Log type (info, success, warning, error)
 * @param {string} message - Log message
 */
export function addLogEntry(type, message) {
    const logPanel = document.getElementById('logPanel');
    if (!logPanel) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    const timestamp = new Date().toLocaleTimeString();
    const typeClass = `log-${type}`;
    const typeLabel = type.toUpperCase();
    
    entry.innerHTML = `
        <span class="log-timestamp">[${typeLabel}]</span>
        <span class="${typeClass}">${message}</span>
    `;
    
    logPanel.appendChild(entry);
    logPanel.scrollTop = logPanel.scrollHeight;
    
    // Keep only last entries to prevent memory issues
    while (logPanel.children.length > CONFIG.LOG_MAX_ENTRIES) {
        logPanel.removeChild(logPanel.firstChild);
    }

    // Also log to console for debugging
    console.log(`[${typeLabel}] ${message}`);
}

/**
 * Clear system log
 */
export function clearLog() {
    const logPanel = document.getElementById('logPanel');
    if (logPanel) {
        logPanel.innerHTML = '';
        addLogEntry('info', '🗑️ Log cleared');
    }
}

/**
 * Format large numbers
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Format currency
 * @param {number} value - Currency value
 * @returns {string} Formatted currency
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Create loading overlay
 * @param {string} text - Loading text
 */
export function showLoading(text = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        const textElement = overlay.querySelector('.loading-text');
        if (textElement) {
            textElement.textContent = text;
        }
        overlay.style.display = 'flex';
    }
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Duration in ms
 */
export function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Remove after duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

/**
 * Local storage helpers
 */
export const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(`stockHunter_${key}`, JSON.stringify(value));
        } catch (error) {
            console.warn('LocalStorage not available:', error);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`stockHunter_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('LocalStorage not available:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(`stockHunter_${key}`);
        } catch (error) {
            console.warn('LocalStorage not available:', error);
        }
    }
};

/**
 * Download data as CSV
 * @param {Array} data - Array of objects
 * @param {string} filename - Filename
 */
export function downloadCSV(data, filename) {
    if (!data || data.length === 0) {
        addLogEntry('warning', '⚠️ No data to export');
        return;
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            let value = row[header] || '';
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvContent += values.join(',') + '\n';
    });
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    addLogEntry('success', `💾 Downloaded ${filename}`);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty
 */
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Sleep function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} Promise that resolves with result
 */
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (i === maxRetries) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, i);
            addLogEntry('warning', `⚠️ Retry ${i + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
            await sleep(delay);
        }
    }
    
    throw lastError;
}