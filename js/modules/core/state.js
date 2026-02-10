// State Management - Simplified and Optimized
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
    
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    },
    
    setState(newState) {
        const oldState = this.state;
        this.state = { ...this.state, ...newState };
        
        // Persist data
        if (this.state.user) {
            TaskTrackerStorage.saveUser(this.state.user);
            TaskTrackerStorage.saveTasks(this.state.tasks);
        }
        
        // Notify listeners
        this.notifyListeners(oldState, this.state);
        
        return this.state;
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
    addTask(task) {
        const tasks = [...this.state.tasks, task];
        return this.setState({ tasks });
    },
    
    updateTask(taskId, updates) {
        const tasks = this.state.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
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
    
    getFilteredTasks() {
        const { tasks, filters } = this.state;
        let filtered = tasks;
        
        if (filters.status === 'active') {
            filtered = filtered.filter(task => !task.completed);
        } else if (filters.status === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }
        
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
        
        return {
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
};