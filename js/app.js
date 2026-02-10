// Main Application Controller
const TaskTrackerApp = {
    init() {
        console.log('Task Tracker Pro Initializing...');
        
        // Initialize state
        TaskTrackerState.init();
        
        // Initialize auth on login page
        if (window.location.pathname.includes('index.html') || 
            window.location.pathname === '/') {
            TaskTrackerAuth.init();
            this.setupLoginPage();
        }
        
        // Initialize dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            this.setupDashboard();
        }
        
        // Setup global state subscription
        this.setupStateSubscription();
        
        console.log('Task Tracker Pro Ready!');
    },
    
    setupLoginPage() {
        // Check if user is already logged in
        const user = TaskTrackerState.getState().user;
        if (user) {
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 100);
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