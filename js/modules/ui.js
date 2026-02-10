// UI Rendering Module
const TaskTrackerUI = {
    init() {
        this.setupEventListeners();
        this.render();
    },
    
    setupEventListeners() {
        // These will be set up by the main app
    },
    
    render() {
        this.renderNotifications();
        this.updateTheme();
        this.renderTaskList();
        this.updateStats();
        this.updateUserInfo();
    },
    
    renderNotifications() {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;
        
        const notifications = TaskTrackerState.getState().ui.notifications;
        
        container.innerHTML = notifications.map(notification => `
            <div class="notification notification-${notification.type}">
                <div class="notification-content">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                    <span>${notification.message}</span>
                </div>
                <button class="notification-close" data-id="${notification.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // Attach close listeners
        container.querySelectorAll('.notification-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                TaskTrackerState.removeNotification(id);
            });
        });
    },
    
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'bell';
        }
    },
    
    updateTheme() {
        const theme = TaskTrackerState.getState().ui.theme;
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(theme + '-theme');
        
        // Update theme toggle button
        const themeToggle = document.querySelector('[data-action="toggle-theme"]');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    },
    
    renderTaskList() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        const tasks = TaskTrackerState.getFilteredTasks();
        
        if (tasks.length === 0) {
            taskList.innerHTML = this.renderEmptyState();
            return;
        }
        
        taskList.innerHTML = tasks.map(task => this.renderTaskItem(task)).join('');
        this.attachTaskEventListeners();
        
        // Update filtered count
        this.updateFilteredCount();
    },
    
    renderTaskItem(task) {
        const priorityColors = {
            high: '#f44336',
            medium: '#FF9800',
            low: '#4CAF50'
        };
        
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;
        const dueText = dueDate ? this.formatDate(dueDate) : 'No due date';
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox-container">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                </div>
                
                <div class="task-content">
                    <div class="task-header">
                        <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
                        ${task.starred ? '<span class="star-indicator"><i class="fas fa-star"></i></span>' : ''}
                    </div>
                    
                    ${task.description ? `
                        <p class="task-description">${this.escapeHtml(task.description)}</p>
                    ` : ''}
                    
                    <div class="task-footer">
                        <div class="task-tags">
                            ${task.priority !== 'none' ? `
                                <span class="priority-badge" style="background: ${priorityColors[task.priority] || '#9e9e9e'}">
                                    <i class="fas fa-flag"></i> ${task.priority}
                                </span>
                            ` : ''}
                            
                            ${task.tags?.map(tag => `
                                <span class="tag">${this.escapeHtml(tag)}</span>
                            `).join('') || ''}
                            
                            <span class="due-date ${isOverdue ? 'overdue' : ''}">
                                <i class="fas fa-calendar"></i> ${dueText}
                            </span>
                        </div>
                        
                        <div class="task-actions">
                            <button class="btn-icon edit-btn" title="Edit task">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete-btn" title="Delete task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderEmptyState() {
        const { filters } = TaskTrackerState.getState();
        let message = 'No tasks yet. Create your first task!';
        let icon = 'fas fa-tasks';
        
        if (filters.search) {
            message = 'No tasks match your search';
            icon = 'fas fa-search';
        } else if (filters.status === 'completed') {
            message = 'No completed tasks';
            icon = 'fas fa-check-circle';
        } else if (filters.status === 'active') {
            message = 'No active tasks';
            icon = 'fas fa-clock';
        }
        
        return `
            <div class="empty-state">
                <i class="${icon}"></i>
                <h3>${message}</h3>
                ${filters.search || filters.status !== 'all' ? `
                    <button class="btn btn-secondary" onclick="TaskTrackerUI.clearFilters()">
                        Clear filters
                    </button>
                ` : ''}
            </div>
        `;
    },
    
    attachTaskEventListeners() {
        // Checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.closest('.task-item')?.dataset.taskId;
                if (taskId) {
                    TaskTrackerTasks.toggleTaskComplete(taskId);
                }
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item')?.dataset.taskId;
                if (taskId) {
                    this.openTaskModal(taskId);
                }
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item')?.dataset.taskId;
                if (taskId) {
                    TaskTrackerTasks.deleteTask(taskId);
                }
            });
        });
    },
    
    updateFilteredCount() {
        const filteredCount = TaskTrackerState.getFilteredTasks().length;
        const totalCount = TaskTrackerState.getState().tasks.length;
        
        const filteredCountEl = document.getElementById('filteredCount');
        const totalCountEl = document.getElementById('totalCount');
        
        if (filteredCountEl) filteredCountEl.textContent = filteredCount;
        if (totalCountEl) totalCountEl.textContent = totalCount;
        
        // Update stat cards
        this.updateStats();
    },
    
    updateStats() {
        const stats = TaskTrackerState.getTaskStatistics();
        
        // Update stat elements
        ['totalTasks', 'completedTasks', 'pendingTasks', 'overdueTasks'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = stats[id.replace('Tasks', '').toLowerCase()] || 0;
        });
        
        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${stats.completionRate}%`;
            progressBar.textContent = `${stats.completionRate}%`;
        }
        
        // Update quick stats cards
        ['totalTasksCard', 'completedTasksCard', 'pendingTasksCard', 'overdueTasksCard'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const statKey = id.replace('Card', '').replace('total', 'total').replace('completed', 'completed')
                    .replace('pending', 'pending').replace('overdue', 'overdue');
                el.textContent = stats[statKey] || 0;
            }
        });
    },
    
    updateUserInfo() {
        const user = TaskTrackerState.getState().user;
        
        if (user) {
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userAvatar = document.getElementById('userAvatar');
            
            if (userName) userName.textContent = user.name;
            if (userEmail) userEmail.textContent = user.email;
            
            if (userAvatar && user.avatar) {
                userAvatar.textContent = user.avatar.initials;
                userAvatar.style.backgroundColor = user.avatar.color;
            }
        }
    },
    
    openTaskModal(taskId = null) {
        const modal = document.getElementById('modal');
        if (!modal) return;
        
        let task = null;
        if (taskId) {
            task = TaskTrackerState.getState().tasks.find(t => t.id === taskId);
        }
        
        const isEdit = !!task;
        const dueDate = task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Edit Task' : 'Create New Task'}</h3>
                    <button class="btn-icon modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form class="modal-form" id="taskForm">
                    <input type="hidden" name="id" value="${task?.id || ''}">
                    
                    <div class="form-group">
                        <label for="taskTitle">Title *</label>
                        <input type="text" id="taskTitle" name="title" value="${task?.title || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="taskDescription">Description</label>
                        <textarea id="taskDescription" name="description" rows="3">${task?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskPriority">Priority</label>
                            <select id="taskPriority" name="priority">
                                <option value="none" ${task?.priority === 'none' ? 'selected' : ''}>None</option>
                                <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${task?.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="taskDueDate">Due Date</label>
                            <input type="date" id="taskDueDate" name="dueDate" value="${dueDate}">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        modal.classList.add('active');
        
        // Setup modal event listeners
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        const form = document.getElementById('taskForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                TaskTrackerTasks.saveTask(data);
                modal.classList.remove('active');
            });
        }
    },
    
    clearFilters() {
        TaskTrackerState.clearFilters();
        TaskTrackerState.addNotification('Filters cleared', 'info');
    },
    
    formatDate(date) {
        const now = new Date();
        const taskDate = new Date(date);
        const diffTime = Math.abs(now - taskDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return taskDate.toLocaleDateString();
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};