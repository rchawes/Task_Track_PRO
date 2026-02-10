// Authentication Module - Simplified and Debugged Version
const TaskTrackerAuth = {
    init() {
        console.log('Auth module initialized');
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Demo login button
        const demoBtn = document.getElementById('demoLoginBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDemoLogin();
            });
        }
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // Tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });
    },
    
    handleDemoLogin() {
        console.log('Demo login requested');
        
        // Create demo user
        const demoUser = {
            id: 'demo_user_001',
            name: 'Demo User',
            email: 'demo@tasktracker.com',
            avatar: { initials: 'DU', color: '#4b6cb7' }
        };
        
        // Create demo tasks
        const demoTasks = [
            {
                id: 'task_1',
                title: 'Welcome to Task Tracker Pro!',
                description: 'This is your first task. Try editing or deleting it.',
                priority: 'high',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 'task_2',
                title: 'Create a new task',
                description: 'Click the "New Task" button to create your own tasks',
                priority: 'medium',
                completed: true,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        
        // Save to storage
        TaskTrackerStorage.saveUser(demoUser);
        TaskTrackerStorage.saveTasks(demoTasks);
        
        // Redirect
        alert('Demo login successful! Redirecting to dashboard...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    },
    
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }
        
        // For simplicity, accept any login
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
    },
    
    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!name || !email || !password || !confirmPassword) {
            alert('All fields are required');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Create user
        const user = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            avatar: { initials: name[0].toUpperCase(), color: '#4b6cb7' }
        };
        
        TaskTrackerStorage.saveUser(user);
        alert('Registration successful!');
        
        // Auto login
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = password;
        this.switchAuthTab('login');
    },
    
    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tabName}Form`);
        });
    }
};