/*
 * Main Application Entry Point
 */

import auth from './modules/auth.js';
import taskManager from './modules/tasks.js';
import workspaceManager from './modules/workspace.js';
import ui from './modules/ui.js';
import { appState } from './core/state.js';
import { eventSystem, Events } from './core/events.js';

class TaskTrackerApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.init();
    }
    
    async init() {
        try {
            // Set loading state
            appState.setLoading(true);
            
            // Initialize modules
            this.modules = {
                auth,
                taskManager,
                workspaceManager,
                ui
            };
            
            // Setup global event handlers
            this.setupGlobalEvents();
            
            // Setup UI event bindings
            this.setupUIEventBindings();
            
            // Check authentication and redirect if needed
            await this.checkAuthAndRedirect();
            
            // Hide loading state
            appState.setLoading(false);
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Dispatch app ready event
            eventSystem.emit(Events.APP_READY);
            
            console.log('Task Tracker Pro initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            appState.setLoading(false);
            appState.addNotification('Failed to initialize application', 'error');
            eventSystem.emit(Events.APP_ERROR, { error });
        }
    }
    
    setupGlobalEvents() {
        // Handle errors globally
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            appState.addNotification('An unexpected error occurred', 'error');
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            appState.addNotification('An operation failed', 'error');
        });
        
        // Save data before page unload
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });
        
        // Handle offline/online status
        window.addEventListener('offline', () => {
            appState.addNotification('You are offline. Changes will be saved locally.', 'warning');
        });
        
        window.addEventListener('online', () => {
            appState.addNotification('You are back online.', 'success');
        });
    }
    
    setupUIEventBindings() {
        // This will be called after DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Theme toggle
            const themeToggle = document.querySelector('[data-action="toggle-theme"]');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    eventSystem.emit(Events.THEME_TOGGLE);
                });
            }
            
            // New task button
            const newTaskBtn = document.getElementById('newTaskBtn');
            if (newTaskBtn) {
                newTaskBtn.addEventListener('click', () => {
                    eventSystem.emit(Events.MODAL_OPEN, { type: 'task' });
                });
            }
            
            // Logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    eventSystem.emit(Events.AUTH_LOGOUT);
                });
            }
            
            // Search input
            const searchInput = document.getElementById('taskSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    eventSystem.emit(Events.SEARCH_CHANGE, { query: e.target.value });
                });
            }
            
            // Filter buttons
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filter = e.target.dataset.filter;
                    const value = e.target.dataset.value || 'all';
                    eventSystem.emit(Events.FILTER_CHANGE, { [filter]: value });
                });
            });
            
            // Clear filters button
            const clearFiltersBtn = document.getElementById('clearFiltersBtn');
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', () => {
                    eventSystem.emit(Events.FILTER_CLEAR);
                });
            }
            
            // Auth forms
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(loginForm);
                    const data = Object.fromEntries(formData.entries());
                    eventSystem.emit(Events.AUTH_LOGIN, data);
                });
            }
            
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(registerForm);
                    const data = Object.fromEntries(formData.entries());
                    eventSystem.emit(Events.AUTH_REGISTER, data);
                });
            }
            
            // Auth tabs
            document.querySelectorAll('.auth-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const tabName = e.target.dataset.tab;
                    this.switchAuthTab(tabName);
                });
            });
            
            // Export/Import buttons
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.modules.taskManager.exportTasks();
                });
            }
            
            const importBtn = document.getElementById('importBtn');
            if (importBtn) {
                importBtn.addEventListener('click', () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            this.modules.taskManager.importTasks(file);
                        }
                    });
                    input.click();
                });
            }
        });
    }
    
    async checkAuthAndRedirect() {
        const user = appState.getState().user;
        const currentPage = window.location.pathname.split('/').pop();
        
        if (!user) {
            // Not logged in
            if (currentPage !== 'index.html' && currentPage !== '') {
                window.location.href = 'index.html';
            }
        } else {
            // Logged in
            if (currentPage === 'index.html' || currentPage === '') {
                window.location.href = 'dashboard.html';
            }
        }
    }
    
    saveAllData() {
        // Data is auto-saved via state persistence
        console.log('All data saved automatically');
    }
    
    switchAuthTab(tabName) {
        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Show active form
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tabName}Form`);
        });
    }
    
    // Public API for debugging
    getModule(moduleName) {
        return this.modules[moduleName];
    }
    
    getState() {
        return appState.getState();
    }
    
    debug() {
        console.log('App State:', this.getState());
        console.log('Modules:', Object.keys(this.modules));
        console.log('Initialized:', this.isInitialized);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and expose app instance
    const app = new TaskTrackerApp();
    window.TaskTrackerApp = app;
    
    // Expose for debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.app = app;
        console.log('Task Tracker Pro debug mode enabled');
        console.log('Use window.TaskTrackerApp.debug() to see app state');
    }
});

// Export for module systems
export default TaskTrackerApp;