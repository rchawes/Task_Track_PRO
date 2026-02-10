// Storage Management 
const TaskTrackerStorage = {
    prefix: 'task_tracker_',
    
    // Initialize demo user on first load
    init() {
        this.initDemoUser();
    },
    
    initDemoUser() {
        const users = this.getUsers();
        const hasDemoUser = users.some(u => u.email === 'demo@tasktracker.com');
        
        if (!hasDemoUser) {
            console.log('Creating demo user...');
            const demoUser = {
                id: 'demo_user_001',
                name: 'Demo User',
                email: 'demo@tasktracker.com',
                password: 'demo123',
                avatar: {
                    initials: 'DU',
                    color: '#4b6cb7'
                },
                createdAt: new Date().toISOString()
            };
            users.push(demoUser);
            this.saveUsers(users);
            console.log('Demo user created successfully');
        }
    },
    
    set(key, data) {
        try {
            const itemKey = this.prefix + key;
            const itemData = JSON.stringify(data);
            localStorage.setItem(itemKey, itemData);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    get(key) {
        try {
            const itemKey = this.prefix + key;
            const data = localStorage.getItem(itemKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },
    
    remove(key) {
        const itemKey = this.prefix + key;
        localStorage.removeItem(itemKey);
    },
    
    clear() {
        // Clear only our app's data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        }
    },
    
    // User management
    saveUser(user) {
        return this.set('current_user', user);
    },
    
    getCurrentUser() {
        return this.get('current_user');
    },
    
    saveTasks(tasks) {
        const user = this.getCurrentUser();
        if (!user || !user.id) return false;
        return this.set(`tasks_${user.id}`, tasks);
    },
    
    getTasks() {
        const user = this.getCurrentUser();
        if (!user || !user.id) return [];
        return this.get(`tasks_${user.id}`) || [];
    },
    
    saveSettings(settings) {
        const user = this.getCurrentUser();
        if (!user || !user.id) return false;
        return this.set(`settings_${user.id}`, settings);
    },
    
    getSettings() {
        const user = this.getCurrentUser();
        if (!user || !user.id) return {};
        return this.get(`settings_${user.id}`) || {};
    },
    
    // Users database
    getUsers() {
        return this.get('users') || [];
    },
    
    saveUsers(users) {
        return this.set('users', users);
    },
    
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    }
};

// Initialize storage when file loads
TaskTrackerStorage.init();