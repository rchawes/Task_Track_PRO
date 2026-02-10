// State Management - Further Improved and Debugged
const TaskTrackerState = {
    user: null,
    tasks: [],
    filters: {
        status: 'all',
        priority: 'all',
        search: ''
    },
    theme: 'light',
    notifications: [],
    
    setUser(user) {
        this.user = user;
        this.tasks = this.storage?.getTasks() || [];
        console.log('State user set:', user, 'Tasks loaded:', this.tasks.length);
    },
    
    setTasks(tasks) {
        this.tasks = tasks;
        if (this.user && this.storage) {
            this.storage.saveTasks(tasks);
        }
        this.render();
    },
    
    addTask(task) {
        const newTask = {
            ...task,
            id: 'task_' + Date.now(),
            createdAt: new Date().toISOString(),
            completed: false
        };
        
        this.tasks = [...this.tasks, newTask];
        if (this.user && this.storage) {
            this.storage.saveTasks(this.tasks);
        }
        this.render();
        this.showNotification('Task created successfully', 'success');
        return newTask;
    },
    
    updateTask(taskId, updates) {
        this.tasks = this.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
        );
        
        if (this.user && this.storage) {
            this.storage.saveTasks(this.tasks);
        }
        this.render();
        this.showNotification('Task updated successfully', 'success');
    },
    
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        
        if (this.user && this.storage) {
            this.storage.saveTasks(this.tasks);
        }
        this.render();
        this.showNotification('Task deleted', 'info');
    },
    
    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.updateTask(taskId, { completed: !task.completed });
        }
    },
    
    setFilter(filter, value) {
        this.filters[filter] = value;
        this.render();
    },
    
    clearFilters() {
        this.filters = {
            status: 'all',
            priority: 'all',
            search: ''
        };
        this.render();
        this.showNotification('Filters cleared', 'info');
    },
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme', this.theme === 'dark');
        document.body.classList.toggle('light-theme', this.theme === 'light');
        
        // Update button icon
        const themeBtn = document.querySelector('[data-action="toggle-theme"]');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        if (this.user && this.storage) {
            this.storage.saveSettings({ theme: this.theme });
        }
    },
    
    showNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type
        };
        
        this.notifications.push(notification);
        this.renderNotifications();
        
        setTimeout(() => {
            this.notifications = this.notifications.filter(n => n.id !== notification.id);
            this.renderNotifications();
        }, 3000);
    },
    
    render() {
        // Trigger UI update
        if (window.TaskTrackerUI && window.TaskTrackerUI.render) {
            window.TaskTrackerUI.render();
        }
    },
    
    renderNotifications() {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;
        
        container.innerHTML = this.notifications.map(n => `
            <div class="notification notification-${n.type}">
                <div class="notification-content">
                    <i class="fas fa-${this.getNotificationIcon(n.type)}"></i>
                    <span>${n.message}</span>
                </div>
                <button onclick="TaskTrackerState.removeNotification(${n.id})" class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    },
    
    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.renderNotifications();
    },
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'bell';
    },
    
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        // Filter by status
        if (this.filters.status === 'active') {
            filtered = filtered.filter(task => !task.completed);
        } else if (this.filters.status === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }
        
        // Filter by search
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                (task.description && task.description.toLowerCase().includes(searchTerm))
            );
        }
        
        return filtered;
    },
    
    getStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        return {
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
};