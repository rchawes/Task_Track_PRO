// Authentication Module
const TaskTrackerAuth = {
    init() {
        console.log('Auth module initializing...');
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('Login form found');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                this.handleLogin();
            });
        }
        
        // Demo login button
        const demoBtn = document.getElementById('demoLoginBtn');
        if (demoBtn) {
            console.log('Demo button found');
            demoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Demo login clicked');
                this.handleDemoLogin();
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
        
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });
    },
    
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Login attempt:', email, password ? '***' : 'empty');
        
        if (!email || !password) {
            this.showMessage('Please enter email and password', 'error');
            return;
        }
        
        const users = TaskTrackerStorage.getUsers();
        console.log('Total users:', users.length);
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            this.showMessage('Invalid email or password', 'error');
            return;
        }
        
        console.log('User found:', user);
        
        // Create user session data
        const userSession = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        };
        
        // Save user to localStorage
        TaskTrackerStorage.saveUser(userSession);
        
        // Show success and redirect
        this.showMessage(`Welcome back, ${user.name}!`, 'success');
        
        // Redirect IMMEDIATELY
        setTimeout(() => {
            console.log('Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        }, 800);
    },
    
    handleDemoLogin() {
        console.log('Demo login initiated');
        
        // Set demo credentials
        document.getElementById('loginEmail').value = 'demo@tasktracker.com';
        document.getElementById('loginPassword').value = 'demo123';
        
        // Submit form
        this.handleLogin();
    },
    
    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showMessage('All fields are required', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        const users = TaskTrackerStorage.getUsers();
        
        if (users.some(u => u.email === email)) {
            this.showMessage('Email already registered', 'error');
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
        
        // Save user
        users.push(newUser);
        TaskTrackerStorage.saveUsers(users);
        
        // Auto login
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = password;
        this.switchAuthTab('login');
        
        this.showMessage('Account created! Please login.', 'success');
    },
    
    generateAvatar(name) {
        const colors = ['#4b6cb7', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3'];
        const initials = name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        const colorIndex = name.length % colors.length;
        
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
    
    showMessage(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to container
        const container = document.getElementById('notificationsContainer') || document.body;
        if (document.getElementById('notificationsContainer')) {
            document.getElementById('notificationsContainer').appendChild(notification);
        } else {
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'success' ? '#4CAF50' : '#f44336'};
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 9999;
                font-family: sans-serif;
            `;
            document.body.appendChild(notification);
        }
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};