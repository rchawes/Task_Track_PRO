// Main Application Controller - Streamlined and Modularized
const TaskTrackerApp = {
    init() {
        console.log('Task Tracker Pro Initializing...');
        
        // Get current page
        const currentPage = window.location.pathname.split('/').pop();
        
        // Initialize based on page
        if (currentPage === 'index.html' || currentPage === '' || currentPage.includes('index')) {
            console.log('Initializing login page');
            this.initLoginPage();
        } else if (currentPage === 'dashboard.html' || currentPage.includes('dashboard')) {
            console.log('Initializing dashboard');
            this.initDashboard();
        }
    },
    
    initLoginPage() {
        // Initialize auth module
        TaskTrackerAuth.init();
        
        // Check if already logged in
        const user = TaskTrackerStorage.getCurrentUser();
        if (user) {
            console.log('User already logged in, redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        }
    },
    
    initDashboard() {
        // Check authentication
        const user = TaskTrackerStorage.getCurrentUser();
        console.log('Dashboard user check:', user);
        
        if (!user) {
            console.log('No user found, redirecting to login');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
            return;
        }
        
        console.log('User authenticated:', user.name);
        
        // Initialize state with user data
        TaskTrackerState.setState({
            user: user,
            tasks: TaskTrackerStorage.getTasks() || []
        });
        
        // Initialize modules
        TaskTrackerTasks.init();
        TaskTrackerUI.init();
        
        // Setup dashboard events
        this.setupDashboardEvents();
        
        // Render UI
        TaskTrackerUI.render();
    },
    
    setupDashboardEvents() {
        // Theme toggle
        const themeToggle = document.querySelector('[data-action="toggle-theme"]');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                TaskTrackerState.toggleTheme();
            });
        }
        
        // New task button
        const newTaskBtn = document.getElementById('newTaskBtn');
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => {
                TaskTrackerUI.openTaskModal();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        // Search input
        const searchInput = document.getElementById('taskSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                TaskTrackerState.setFilter('search', e.target.value);
            });
        }
        
        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                const value = e.target.dataset.value || 'all';
                TaskTrackerState.setFilter(filter, value);
            });
        });
        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                TaskTrackerState.clearFilters();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                TaskTrackerTasks.exportTasks();
            });
        }
    },
    
    handleLogout() {
        // Clear user from storage
        TaskTrackerStorage.remove('current_user');
        
        // Clear state
        TaskTrackerState.setState({
            user: null,
            tasks: []
        });
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
};

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    TaskTrackerApp.init();
});

// Expose for debugging
window.TaskTrackerApp = TaskTrackerApp;