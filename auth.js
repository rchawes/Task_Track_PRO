/*
 * Task Tracker Pro - Authentication Module
 * This simulates a real authentication system using localStorage
 */

class AuthSystem {
    constructor() {
        this.users = Storage.getUsers();
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }
    
    init() {
        // Setup tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Setup login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Setup register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        // Auto-redirect if already logged in
        if (this.currentUser) {
            window.location.href = 'dashboard.html';
        }
        
        // Add demo user if none exists
        if (!this.users.some(u => u.email === 'demo@tasktracker.com')) {
            this.users.push({
                id: this.generateId(),
                name: 'Demo User',
                email: 'demo@tasktracker.com',
                password: 'demo123', // In real app, this would be hashed
                avatar: '👨‍💻',
                role: 'admin',
                createdAt: new Date().toISOString()
            });
            this.saveUsers();
        }
    }
    
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Show active form
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tabName}Form`);
        });
    }
    
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Find user
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Success
            this.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            };
            
            // Save to localStorage
            if (rememberMe) {
                Storage.saveUsers(this.users);
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            
            // Show success message
            this.showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // Error
            this.showMessage('Invalid email or password', 'error');
        }
    }
    
    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (this.users.some(u => u.email === email)) {
            this.showMessage('Email already registered', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: this.generateId(),
            name: name,
            email: email,
            password: password, // In real app, hash this
            avatar: this.generateAvatar(name),
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this.saveUsers();
        
        // Auto-login
        this.currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            role: newUser.role
        };
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        this.showMessage('Account created successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    generateAvatar(name) {
        // Simple emoji-based avatar generator
        const emojis = ['👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍🚀', '👩‍🚀', '🧑‍🚀'];
        const firstLetter = name.charCodeAt(0);
        return emojis[firstLetter % emojis.length];
    }
    
    saveUsers() {
        localStorage.setItem('taskTrackerUsers', JSON.stringify(this.users));
    }
    
    showMessage(text, type = 'info') {
        // Remove existing message
        const existing = document.querySelector('.auth-message');
        if (existing) existing.remove();
        
        // Create message element
        const message = document.createElement('div');
        message.className = `auth-message auth-message-${type}`;
        message.innerHTML = `
            <i class="fas fa-${this.getMessageIcon(type)}"></i>
            <span>${text}</span>
        `;
        
        // Add styles
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            background-color: ${this.getMessageColor(type)};
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
    
    getMessageIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'info': return 'info-circle';
            default: return 'info-circle';
        }
    }
    
    getMessageColor(type) {
        switch(type) {
            case 'success': return '#4CAF50';
            case 'error': return '#f44336';
            case 'info': return '#2196F3';
            default: return '#666';
        }
    }
    
    logout() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    }
}

// Initialize auth system
const auth = new AuthSystem();