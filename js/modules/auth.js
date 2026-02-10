/*
 * Authentication Module
 */

import { appState } from '../core/state.js';
import { eventSystem, Events } from '../core/events.js';
import { storage } from '../core/storage.js';

class Authentication {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('task_tracker_users')) || [];
        this.initDemoUser();
        this.setupEventListeners();
    }
    
    initDemoUser() {
        // Add demo user if not exists
        const hasDemoUser = this.users.some(u => u.email === 'demo@tasktracker.com');
        if (!hasDemoUser) {
            this.users.push({
                id: 'demo_user_001',
                name: 'Demo User',
                email: 'demo@tasktracker.com',
                password: 'demo123',
                avatar: '👨‍💻',
                createdAt: new Date().toISOString(),
                lastLogin: null
            });
            localStorage.setItem('task_tracker_users', JSON.stringify(this.users));
        }
    }
    
    setupEventListeners() {
        eventSystem.on(Events.AUTH_LOGIN, (data) => this.handleLogin(data));
        eventSystem.on(Events.AUTH_REGISTER, (data) => this.handleRegister(data));
        eventSystem.on(Events.AUTH_LOGOUT, () => this.handleLogout());
    }
    
    handleLogin(credentials) {
        try {
            const { email, password } = credentials;
            
            // Validation
            if (!email || !password) {
                appState.addNotification('Please enter email and password', 'error');
                return false;
            }
            
            // Find user
            const user = this.users.find(u => 
                u.email === email && u.password === password
            );
            
            if (!user) {
                appState.addNotification('Invalid email or password', 'error');
                return false;
            }
            
            // Update last login
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('task_tracker_users', JSON.stringify(this.users));
            
            // Login user
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            };
            
            appState.login(userData);
            appState.addNotification(`Welcome back, ${user.name}!`, 'success');
            
            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
            return true;
            
        } catch (error) {
            console.error('Login error:', error);
            appState.addNotification('Login failed. Please try again.', 'error');
            return false;
        }
    }
    
    handleRegister(userData) {
        try {
            const { name, email, password, confirmPassword } = userData;
            
            // Validation
            if (!name || !email || !password || !confirmPassword) {
                appState.addNotification('All fields are required', 'error');
                return false;
            }
            
            if (password.length < 6) {
                appState.addNotification('Password must be at least 6 characters', 'error');
                return false;
            }
            
            if (password !== confirmPassword) {
                appState.addNotification('Passwords do not match', 'error');
                return false;
            }
            
            if (this.users.some(u => u.email === email)) {
                appState.addNotification('Email already registered', 'error');
                return false;
            }
            
            // Create new user
            const newUser = {
                id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                avatar: this.generateAvatar(name),
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            
            // Save user
            this.users.push(newUser);
            localStorage.setItem('task_tracker_users', JSON.stringify(this.users));
            
            // Auto login
            return this.handleLogin({ email, password });
            
        } catch (error) {
            console.error('Registration error:', error);
            appState.addNotification('Registration failed. Please try again.', 'error');
            return false;
        }
    }
    
    handleLogout() {
        appState.logout();
        appState.addNotification('Logged out successfully', 'info');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
    
    generateAvatar(name) {
        const colors = ['#4b6cb7', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3', '#795548'];
        const initials = name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        const colorIndex = name
            .split('')
            .reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
        
        return {
            initials,
            color: colors[colorIndex]
        };
    }
    
    getCurrentUser() {
        return appState.getState().user;
    }
    
    isAuthenticated() {
        return !!this.getCurrentUser();
    }
}

// Create and export singleton
const auth = new Authentication();
export default auth;