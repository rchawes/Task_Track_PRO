// Authentication Module - FIXED VERSION
const TaskTrackerAuth = {
    init() {
        console.log('Auth module initializing...');
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('Login form found, attaching listener');
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
            demoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDemoLogin();
            });
        }
        
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });
        
        console.log('Auth event listeners setup complete');
    },
    
    handleLogin() {
        console.log('Login attempted');
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Email:', email, 'Password:', password ? '***' : 'empty');
        
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }
        
        const users = TaskTrackerStorage.getUsers();
        console.log('Total users in storage:', users.length);
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            alert('Invalid email or password');
            return;
        }
        
        console.log('User found:', user);
        
        // Create user data for state
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        };
        
        // Save to storage FIRST
        console.log('Saving user to storage...');
        TaskTrackerStorage.saveUser(userData);
        
        // Load tasks for this user
        const tasks = TaskTrackerStorage.getTasks();
        console.log('Loaded tasks for user:', tasks.length);
        
        // Update state
        TaskTrackerState.setState({
            user: userData,
            tasks: tasks,
            ui: {
                theme: 'light',
                loading: false,
                notifications: []
            }
        });
        
        // Show success message
        console.log('Login successful, redirecting...');
        alert(`Welcome back, ${user.name}! Redirecting to dashboard...`);
        
        // Force redirect immediately
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    },
    
    handleDemoLogin() {
        console.log('Demo login clicked');
        // Auto-fill demo credentials
        document.getElementById('loginEmail').value = 'demo@tasktracker.com';
        document.getElementById('loginPassword').value = 'demo123';
        this.handleLogin();
    },
    
    handleRegister() {
        console.log('Registration attempted');
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            alert('All fields are required');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        const users = TaskTrackerStorage.getUsers();
        
        if (users.some(u => u.email === email)) {
            alert('Email already registered');
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
        
        console.log('Creating new user:', newUser);
        
        // Add to users array
        users.push(newUser);
        TaskTrackerStorage.saveUsers(users);
        
        // Auto login
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = password;
        this.handleLogin();
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
        console.log('Switching to tab:', tabName);
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tabName}Form`);
        });
    },
    
    logout() {
        console.log('Logout requested');
        TaskTrackerStorage.remove('current_user');
        TaskTrackerState.setState({
            user: null,
            tasks: []
        });
        
        alert('Logged out successfully');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
};