// Application State Management
const TaskTrackerState = {
    state: {
        user: null,
        tasks: [],
        filters: {
            status: 'all',
            priority: 'all',
            search: ''
        },
        ui: {
            theme: 'light',
            loading: false,
            notifications: []
        }
    },
    
    listeners: [],
    
    init() {
        // Load from storage
        const user = TaskTrackerStorage.getCurrentUser();
        if (user) {
            this.state.user = user;
            this.state.tasks = TaskTrackerStorage.getTasks();
            
            const settings = TaskTrackerStorage.getSettings();
            if (settings.theme) {
                this.state.ui.theme = settings.theme;
            }
        }
        
        // Initialize demo user
        this.initDemoUser();
    },
    
    initDemoUser() {
        const users = TaskTrackerStorage.getUsers();
        const hasDemoUser = users.some(u => u.email === 'demo@tasktracker.com');
        
        if (!hasDemoUser) {
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
            TaskTrackerStorage.saveUsers(users);
        }
    },
    
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    },
    
    setState(newState) {
        const oldState = this.state;
        this.state = { ...this.state, ...newState };
        this.persist();
        this.notifyListeners(oldState, this.state);
        return this.state;
    },
    
    persist() {
        if (this.state.user) {
            TaskTrackerStorage.saveUser(this.state.user);
            TaskTrackerStorage.saveTasks(this.state.tasks);
            TaskTrackerStorage.saveSettings({
                theme: this.state.ui.theme
            });
        }
    },
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },
    
    notifyListeners(oldState, newState) {
        this.listeners.forEach(listener => {
            try {
                listener(oldState, newState);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    },
    
    // Actions
    login(user) {
        this.setState({
            user,
            tasks: TaskTrackerStorage.getTasks() || []
        });
        return this.state;
    },
    
    logout() {
        TaskTrackerStorage.remove('current_user');
        this.setState({
            user: null,
            tasks: []
        });
        return this.state;
    },
    
    addTask(task) {
        const tasks = [...this.state.tasks, task];
        return this.setState({ tasks });
    },
    
    updateTask(taskId, updates) {
        const tasks = this.state.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        );
        return this.setState({ tasks });
    },
    
    deleteTask(taskId) {
        const tasks = this.state.tasks.filter(task => task.id !== taskId);
        return this.setState({ tasks });
    },
    
    toggleTaskComplete(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            return this.updateTask(taskId, { completed: !task.completed });
        }
        return this.state;
    },
    
    setFilter(filter, value) {
        const filters = { ...this.state.filters, [filter]: value };
        return this.setState({ filters });
    },
    
    clearFilters() {
        return this.setState({
            filters: {
                status: 'all',
                priority: 'all',
                search: ''
            }
        });
    },
    
    toggleTheme() {
        const theme = this.state.ui.theme === 'light' ? 'dark' : 'light';
        return this.setState({
            ui: { ...this.state.ui, theme }
        });
    },
    
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
    },
    
    removeNotification(id) {
        const notifications = this.state.ui.notifications.filter(n => n.id !== id);
        return this.setState({
            ui: { ...this.state.ui, notifications }
        });
    },
    
    setLoading(loading) {
        return this.setState({
            ui: { ...this.state.ui, loading }
        });
    },
    
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
                task.description?.toLowerCase().includes(searchLower)
            );
        }
        
        return filtered;
    },
    
    getTaskStatistics() {
        const tasks = this.state.tasks;
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        const overdue = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            return dueDate < today;
        }).length;
        
        return {
            total,
            completed,
            pending,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
};