/*
 * Storage Module - Handles data persistence
 */

class StorageManager {
    constructor() {
        this.prefix = 'task_tracker_';
    }
    
    // Generic methods
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
    }
    
    get(key) {
        try {
            const itemKey = this.prefix + key;
            const data = localStorage.getItem(itemKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    }
    
    remove(key) {
        const itemKey = this.prefix + key;
        localStorage.removeItem(itemKey);
    }
    
    clear() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    // Application-specific methods
    saveUser(user) {
        return this.set('current_user', user);
    }
    
    getCurrentUser() {
        return this.get('current_user');
    }
    
    saveTasks(tasks) {
        const user = this.getCurrentUser();
        if (!user || !user.id) return false;
        return this.set(`tasks_${user.id}`, tasks);
    }
    
    getTasks() {
        const user = this.getCurrentUser();
        if (!user || !user.id) return [];
        return this.get(`tasks_${user.id}`) || [];
    }
    
    saveWorkspaces(workspaces) {
        const user = this.getCurrentUser();
        if (!user || !user.id) return false;
        return this.set(`workspaces_${user.id}`, workspaces);
    }
    
    getWorkspaces() {
        const user = this.getCurrentUser();
        if (!user || !user.id) return [];
        return this.get(`workspaces_${user.id}`) || [];
    }
    
    saveSettings(settings) {
        const user = this.getCurrentUser();
        if (!user || !user.id) return false;
        return this.set(`settings_${user.id}`, settings);
    }
    
    getSettings() {
        const user = this.getCurrentUser();
        if (!user || !user.id) return {};
        return this.get(`settings_${user.id}`) || {};
    }
}

// Create singleton instance
const storage = new StorageManager();
export { storage };