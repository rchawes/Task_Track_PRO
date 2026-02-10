/*
 * Helper Functions - Reusable utility functions
 */

export const helpers = {
    // ID generation
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Date formatting
    formatDate(date, format = 'medium') {
        const d = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - d);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (format === 'relative') {
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
            return `${Math.floor(diffDays / 365)} years ago`;
        }
        
        const options = {
            short: { month: 'short', day: 'numeric' },
            medium: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
        };
        
        return d.toLocaleDateString('en-US', options[format] || options.medium);
    },
    
    // Time formatting
    formatTime(date) {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },
    
    // Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Deep clone
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Merge objects
    merge(target, ...sources) {
        sources.forEach(source => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    target[key] = this.merge(target[key] || {}, source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        });
        return target;
    },
    
    // Safe HTML escape
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Generate random color
    randomColor() {
        const colors = [
            '#4b6cb7', '#4CAF50', '#FF9800', '#9C27B0',
            '#f44336', '#2196F3', '#00BCD4', '#8BC34A',
            '#795548', '#607D8B'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validate URL
    validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    },
    
    // Generate initials
    getInitials(name) {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },
    
    // Calculate percentage
    calculatePercentage(part, total) {
        return total === 0 ? 0 : Math.round((part / total) * 100);
    },
    
    // Delay promise
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Retry promise with exponential backoff
    async retry(fn, retries = 3, delayMs = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) throw error;
            await this.delay(delayMs);
            return this.retry(fn, retries - 1, delayMs * 2);
        }
    },
    
    // Parse query string
    parseQueryString(query) {
        return query
            .replace(/^\?/, '')
            .split('&')
            .reduce((params, param) => {
                const [key, value] = param.split('=');
                params[key] = decodeURIComponent(value);
                return params;
            }, {});
    },
    
    // Build query string
    buildQueryString(params) {
        return Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    }
};