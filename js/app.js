// Main Application Controller - Hopefully Fixed and Improved
const TaskTrackerApp = {
    modules: {},
    
    init() {
        console.log('=== Task Tracker Pro Initializing ===');
        
        // Initialize all modules
        this.initializeModules();
        
        // Get current page
        const currentPage = this.getCurrentPage();
        console.log('Current page:', currentPage);
        
        // Route to correct page handler
        if (currentPage === 'login') {
            this.handleLoginPage();
        } else if (currentPage === 'dashboard') {
            this.handleDashboardPage();
        }
        
        console.log('=== Task Tracker Pro Ready ===');
    },
    
    initializeModules() {
        console.log('Initializing modules...');
        
        // Initialize storage first
        this.modules.storage = TaskTrackerStorage;
        
        // Initialize state with storage
        this.modules.state = TaskTrackerState;
        this.modules.state.storage = TaskTrackerStorage;
        
        // Initialize other modules
        this.modules.auth = TaskTrackerAuth;
        this.modules.tasks = TaskTrackerTasks;
        this.modules.ui = TaskTrackerUI;
        
        // Inject dependencies
        this.modules.auth.storage = TaskTrackerStorage;
        this.modules.auth.state = TaskTrackerState;
        
        this.modules.tasks.state = TaskTrackerState;
        this.modules.tasks.storage = TaskTrackerStorage;
        
        this.modules.ui.state = TaskTrackerState;
        this.modules.ui.tasks = TaskTrackerTasks;
        
        console.log('Modules initialized:', Object.keys(this.modules));
    },
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('dashboard.html') || path.includes('dashboard')) {
            return 'dashboard';
        }
        return 'login';
    },
    
    handleLoginPage() {
        console.log('Handling login page...');
        
        // Check if already logged in
        const user = TaskTrackerStorage.getCurrentUser();
        if (user) {
            console.log('Already logged in, redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 100);
            return;
        }
        
        // Initialize auth
        TaskTrackerAuth.init();
        
        // Add direct demo login
        this.addDirectDemoLogin();
    },
    
    handleDashboardPage() {
        console.log('Handling dashboard page...');
        
        // Check authentication
        const user = TaskTrackerStorage.getCurrentUser();
        if (!user) {
            console.log('No user found, redirecting to login');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
            return;
        }
        
        console.log('User authenticated:', user.name);
        
        // Initialize state with user data
        TaskTrackerState.setUser(user);
        
        // Initialize all dashboard modules
        TaskTrackerTasks.init();
        TaskTrackerUI.init();
        
        // Setup all event listeners
        this.setupDashboardEventListeners();
        
        // Render initial UI
        setTimeout(() => {
            TaskTrackerUI.render();
        }, 100);
    },
    
    addDirectDemoLogin() {
        // Add a direct login button for testing
        const demoBtn = document.getElementById('demoLoginBtn');
        if (demoBtn) {
            demoBtn.onclick = (e) => {
                e.preventDefault();
                this.loginDemoUser();
            };
        }
        
        // Also handle form submit
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleFormLogin();
            };
        }
    },
    
    loginDemoUser() {
        console.log('Logging in demo user...');
        
        // Create demo user data
        const demoUser = {
            id: 'demo_user_001',
            name: 'Demo User',
            email: 'demo@tasktracker.com',
            avatar: { initials: 'DU', color: '#4b6cb7' }
        };
        
        // Save to storage
        TaskTrackerStorage.saveUser(demoUser);
        
        // Create some demo tasks
        const demoTasks = [
            {
                id: 'task_1',
                title: 'Welcome to Task Tracker Pro!',
                description: 'This is your first task. Edit or delete it to get started.',
                priority: 'high',
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 'task_2',
                title: 'Complete project setup',
                description: 'Set up all necessary project files and configurations',
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0],
                completed: true,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'task_3',
                title: 'Review documentation',
                description: 'Read through the project documentation',
                priority: 'low',
                dueDate: null,
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];
        
        TaskTrackerStorage.saveTasks(demoTasks);
        
        // Show success message
        alert('Demo login successful! Redirecting to dashboard...');
        
        // Redirect
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    },
    
    handleFormLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // For now, accept any login for testing
        if (email && password) {
            const user = {
                id: 'user_' + Date.now(),
                name: email.split('@')[0],
                email: email,
                avatar: { initials: email[0].toUpperCase(), color: '#4b6cb7' }
            };
            
            TaskTrackerStorage.saveUser(user);
            alert('Login successful!');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        }
    },
    
    setupDashboardEventListeners() {
        console.log('Setting up dashboard event listeners...');
        
        // Theme toggle
        document.querySelector('[data-action="toggle-theme"]')?.addEventListener('click', () => {
            TaskTrackerState.toggleTheme();
        });
        
        // New task button
        document.getElementById('newTaskBtn')?.addEventListener('click', () => {
            TaskTrackerUI.openTaskModal();
        });
        
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
        
        // Search input
        document.getElementById('taskSearch')?.addEventListener('input', (e) => {
            TaskTrackerState.setFilter('search', e.target.value);
        });
        
        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                const value = e.target.dataset.value || 'all';
                TaskTrackerState.setFilter(filter, value);
            });
        });
        
        // Clear filters
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            TaskTrackerState.clearFilters();
        });
        
        // Export button
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            TaskTrackerTasks.exportTasks();
        });
        
        // Create first task button
        document.getElementById('createFirstTaskBtn')?.addEventListener('click', () => {
            TaskTrackerUI.openTaskModal();
        });
        
        console.log('All event listeners set up');
    },
    
    handleLogout() {
        TaskTrackerStorage.remove('current_user');
        alert('Logged out successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    window.taskTrackerApp = TaskTrackerApp;
    TaskTrackerApp.init();
});