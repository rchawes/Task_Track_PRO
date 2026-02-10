// storage.js

class Storage {
    // User-related methods
    static getUsers() {
        return JSON.parse(localStorage.getItem('taskTrackerUsers')) || [];
    }

    static saveUsers(users) {
        localStorage.setItem('taskTrackerUsers', JSON.stringify(users));
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser')) || 
               JSON.parse(sessionStorage.getItem('currentUser')) || null;
    }

    static setCurrentUser(user, remember = true) {
        if (remember) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
    }

    static removeCurrentUser() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
    }

    // Task-related methods
    static getTasks() {
        return JSON.parse(localStorage.getItem('userTasks')) || [];
    }

    static saveTasks(tasks) {
        localStorage.setItem('userTasks', JSON.stringify(tasks));
    }

    // Workspace-related methods
    static getWorkspaces() {
        return JSON.parse(localStorage.getItem('workspaces')) || [];
    }

    static saveWorkspaces(workspaces) {
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
    }

    // User settings
    static getUserSettings(userId) {
        return JSON.parse(localStorage.getItem(`userSettings_${userId}`)) || {};
    }

    static saveUserSettings(userId, settings) {
        localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settings));
    }
}

export default storage;