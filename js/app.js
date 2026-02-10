// Main Application Controller
const TaskTrackerApp = {
    init() {
        console.log('=== Task Tracker Pro Initializing ===');
        
        // Initialize state FIRST
        TaskTrackerState.init();
        
        // Get current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log('Current page:', currentPage);
        
        // Check authentication status
        const user = TaskTrackerState.getState().user;
        console.log('Current user:', user);
        
        // Handle page routing
        if (currentPage === 'index.html' || currentPage === '' || currentPage.includes('index')) {
            console.log('On login page');
            if (user) {
                console.log('User already logged in, redirecting to dashboard');
                window.location.href = 'dashboard.html';
                return;
            }
            TaskTrackerAuth.init();
        } else if (currentPage === 'dashboard.html' || currentPage.includes('dashboard')) {
            console.log('On dashboard page');
            if (!user) {
                console.log('No user found, redirecting to login');
                window.location.href = 'index.html';
                return;
            }
            
            // Initialize dashboard
            TaskTrackerTasks.init();
            TaskTrackerUI.init();
            this.setupDashboardEvents();
            TaskTrackerUI.render();
            
            console.log('Dashboard initialized for user:', user.name);
        }
        
        // Setup global state subscription
        this.setupStateSubscription();
        
        console.log('=== Task Tracker Pro Ready ===');
    },
    
    setupLoginPage() {
        // Add console logs for debugging
        console.log('Setting up login page...');
        
        // Check if demo button exists
        const demoBtn = document.getElementById('demoLoginBtn');
        if (demoBtn) {
            console.log('Demo button found');
            demoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Demo button clicked via app.js');
                TaskTrackerAuth.handleDemoLogin();
            });
        }
    },
    
    setupDashboard() {
        const user = TaskTrackerState.getState().user;
        
        // Redirect to login if not authenticated
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        // Initialize modules
        TaskTrackerTasks.init();
        TaskTrackerUI.init();
        
        // Setup dashboard event listeners
        this.setupDashboardEvents();
        
        // Update UI
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
                TaskTrackerAuth.logout();
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
        
        // Create first task button
        const createFirstBtn = document.getElementById('createFirstTaskBtn');
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', () => {
                TaskTrackerUI.openTaskModal();
            });
        }
    },
    
    setupStateSubscription() {
        TaskTrackerState.subscribe((oldState, newState) => {
            // Update UI when state changes
            TaskTrackerUI.render();
        });
    },
    
    // Public API for debugging
    debug() {
        console.log('Current State:', TaskTrackerState.getState());
        console.log('Filtered Tasks:', TaskTrackerState.getFilteredTasks());
        console.log('Statistics:', TaskTrackerState.getTaskStatistics());
    }
};

// Expose to window for debugging
window.taskTrackerApp = TaskTrackerApp;
window.TaskTrackerState = TaskTrackerState;
window.TaskTrackerTasks = TaskTrackerTasks;
window.TaskTrackerUI = TaskTrackerUI;
window.TaskTrackerAuth = TaskTrackerAuth;