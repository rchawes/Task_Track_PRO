// Storage Management
const TaskTrackerStorage = {
    prefix: 'task_tracker_',
    
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
    
    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        return this.saveUsers(users);
    },
    
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    }
};