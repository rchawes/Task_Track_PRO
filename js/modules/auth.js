// Authentication Module
const TaskTrackerAuth = {
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
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
        
        // Demo login button
        const demoBtn = document.getElementById('demoLoginBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.handleDemoLogin();
            });
        }
        
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });
    },
    
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showNotification('Please enter email and password', 'error');
            return;
        }
        
        const users = TaskTrackerStorage.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            this.showNotification('Invalid email or password', 'error');
            return;
        }
        
        // Login successful
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        };
        
        TaskTrackerState.login(userData);
        this.showNotification(`Welcome back, ${user.name}!`, 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    },
    
    handleDemoLogin() {
        // Auto-fill demo credentials
        document.getElementById('loginEmail').value = 'demo@tasktracker.com';
        document.getElementById('loginPassword').value = 'demo123';
        this.handleLogin();
    },
    
    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showNotification('All fields are required', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }
        
        const users = TaskTrackerStorage.getUsers();
        
        if (users.some(u => u.email === email)) {
            this.showNotification('Email already registered', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            avatar: this.generateAvatar(name),
            createdAt: new Date().toISOString()
        };
        
        TaskTrackerStorage.addUser(newUser);
        
        // Auto login
        const userData = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar
        };
        
        TaskTrackerState.login(userData);
        this.showNotification('Registration successful! Welcome!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    },
    
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
    },
    
    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tabName}Form`);
        });
    },
    
    showNotification(message, type = 'info') {
        TaskTrackerState.addNotification(message, type);
    },
    
    logout() {
        TaskTrackerState.logout();
        this.showNotification('Logged out successfully', 'info');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
};