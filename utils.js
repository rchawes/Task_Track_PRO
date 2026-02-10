/*
 * Task Tracker Pro - Utility Functions
 */

class Utils {
    static formatDate(date, format = 'medium') {
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
    }
    
    static formatTime(date) {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    static debounce(func, wait) {
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
    
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    static generateGradient(color1, color2) {
        return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    }
    
    static calculateProgress(total, completed) {
        return total === 0 ? 0 : Math.round((completed / total) * 100);
    }
    
    static getPriorityColor(priority) {
        const colors = {
            high: '#f44336',
            medium: '#FF9800',
            low: '#4CAF50',
            none: '#9e9e9e'
        };
        return colors[priority] || colors.none;
    }
    
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    static downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePassword(password) {
        return password.length >= 6;
    }
    
    static generateAvatar(name) {
        const colors = [
            '#4b6cb7', '#4CAF50', '#FF9800', '#9C27B0', 
            '#f44336', '#2196F3', '#00BCD4', '#8BC34A'
        ];
        
        // Get initials
        const initials = name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        // Get color based on name
        const colorIndex = name
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        
        return {
            initials,
            color: colors[colorIndex]
        };
    }
    
    static animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(start + (end - start) * progress);
            element.textContent = value;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }
}