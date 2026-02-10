/*
 * State Management - Centralized application state
 */

class AppState {
    constructor() {
        this.state = {
            user: null,
            tasks: [],
            workspaces: [],
            currentWorkspace: null,
            filters: {
                status: 'all',
                priority: 'all',
                tags: [],
                search: ''
            },
            ui: {
                theme: 'light',
                loading: false,
                notifications: [],
                modal: null
            }
        };
        
        this.listeners = [];
        this.init();
    }
    
    init() {
        // Load user from storage
        const user = storage.getCurrentUser();
        if (user) {
            this.state.user = user;
            
            // Load user data
            this.state.tasks = storage.getTasks();
            this.state.workspaces = storage.getWorkspaces();
            this.state.currentWorkspace = this.state.workspaces[0]?.id || null;
            
            // Load settings
            const settings = storage.getSettings();
            if (settings.theme) {
                this.state.ui.theme = settings.theme;
            }
        }
    }
    
    // Get current state (immutable)
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    
    // Update state
    setState(newState) {
        const oldState = this.state;
        this.state = { ...this.state, ...newState };
        
        // Persist changes
        this.persist();
        
        // Notify listeners
        this.notifyListeners(oldState, this.state);
        
        return this.state;
    }
    
    // Persist state to storage
    persist() {
        if (this.state.user) {
            storage.saveUser(this.state.user);
            storage.saveTasks(this.state.tasks);
            storage.saveWorkspaces(this.state.workspaces);
            storage.saveSettings({
                theme: this.state.ui.theme
            });
        }
    }
    
    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.push(listener);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    notifyListeners(oldState, newState) {
        this.listeners.forEach(listener => {
            try {
                listener(oldState, newState);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    }
    
    // Actions
    login(user) {
        this.setState({
            user,
            tasks: storage.getTasks() || [],
            workspaces: storage.getWorkspaces() || this.createDefaultWorkspaces(),
            currentWorkspace: null
        });
        
        // Set first workspace as current
        if (this.state.workspaces.length > 0) {
            this.setState({ currentWorkspace: this.state.workspaces[0].id });
        }
        
        return this.state;
    }
    
    logout() {
        storage.remove('current_user');
        this.setState({
            user: null,
            tasks: [],
            workspaces: [],
            currentWorkspace: null
        });
        return this.state;
    }
    
    addTask(task) {
        const tasks = [...this.state.tasks, task];
        return this.setState({ tasks });
    }
    
    updateTask(taskId, updates) {
        const tasks = this.state.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        );
        return this.setState({ tasks });
    }
    
    deleteTask(taskId) {
        const tasks = this.state.tasks.filter(task => task.id !== taskId);
        return this.setState({ tasks });
    }
    
    toggleTaskComplete(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            return this.updateTask(taskId, { completed: !task.completed });
        }
        return this.state;
    }
    
    setFilter(filter, value) {
        const filters = { ...this.state.filters, [filter]: value };
        return this.setState({ filters });
    }
    
    clearFilters() {
        return this.setState({
            filters: {
                status: 'all',
                priority: 'all',
                tags: [],
                search: ''
            }
        });
    }
    
    toggleTheme() {
        const theme = this.state.ui.theme === 'light' ? 'dark' : 'light';
        return this.setState({
            ui: { ...this.state.ui, theme }
        });
    }
    
    addNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString()
        };
        
        const notifications = [...this.state.ui.notifications, notification];
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 5000);
        
        return this.setState({
            ui: { ...this.state.ui, notifications }
        });
    }
    
    removeNotification(id) {
        const notifications = this.state.ui.notifications.filter(n => n.id !== id);
        return this.setState({
            ui: { ...this.state.ui, notifications }
        });
    }
    
    setLoading(loading) {
        return this.setState({
            ui: { ...this.state.ui, loading }
        });
    }
    
    openModal(modalType, modalData = {}) {
        return this.setState({
            ui: { ...this.state.ui, modal: { type: modalType, data: modalData } }
        });
    }
    
    closeModal() {
        return this.setState({
            ui: { ...this.state.ui, modal: null }
        });
    }
    
    // Helper methods
    createDefaultWorkspaces() {
        return [
            {
                id: 'personal',
                name: 'Personal',
                color: '#4b6cb7',
                createdAt: new Date().toISOString()
            },
            {
                id: 'work',
                name: 'Work',
                color: '#4CAF50',
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    getFilteredTasks() {
        const { tasks, filters } = this.state;
        let filtered = tasks;
        
        // Filter by status
        if (filters.status === 'active') {
            filtered = filtered.filter(task => !task.completed);
        } else if (filters.status === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }
        
        // Filter by priority
        if (filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }
        
        // Filter by search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower) ||
                task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }
        
        // Filter by tags
        if (filters.tags.length > 0) {
            filtered = filtered.filter(task => 
                task.tags?.some(tag => filters.tags.includes(tag))
            );
        }
        
        return filtered;
    }
    
    getTaskStatistics() {
        const tasks = this.state.tasks;
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        // Calculate overdue tasks
        const overdue = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            return dueDate < today;
        }).length;
        
        // Calculate priority counts
        const priorityCounts = {
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        };
        
        return {
            total,
            completed,
            pending,
            overdue,
            priorityCounts,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
}

// Create and export singleton instance
const appState = new AppState();
export { appState };