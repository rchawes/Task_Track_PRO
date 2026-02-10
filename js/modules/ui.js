// UI Rendering - Upated and Debugged
const TaskTrackerUI = {
    init() {
        console.log('UI module initialized');
        this.render();
    },
    
    render() {
        this.renderUserInfo();
        this.renderTaskList();
        this.renderStats();
        this.renderNotifications();
        this.applyTheme();
    },
    
    renderUserInfo() {
        const user = TaskTrackerState.user;
        if (!user) return;
        
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName) userName.textContent = user.name;
        if (userEmail) userEmail.textContent = user.email;
        
        if (userAvatar && user.avatar) {
            userAvatar.textContent = user.avatar.initials;
            userAvatar.style.backgroundColor = user.avatar.color;
        }
    },
    
    renderTaskList() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        const tasks = TaskTrackerState.getFilteredTasks();
        const stats = TaskTrackerState.getStatistics();
        
        // Update filtered count
        const filteredCount = document.getElementById('filteredCount');
        const totalCount = document.getElementById('totalCount');
        if (filteredCount) filteredCount.textContent = tasks.length;
        if (totalCount) totalCount.textContent = TaskTrackerState.tasks.length;
        
        // Show/hide empty state
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = tasks.length === 0 ? 'block' : 'none';
            taskList.style.display = tasks.length === 0 ? 'none' : 'block';
        }
        
        if (tasks.length === 0) {
            taskList.innerHTML = '';
            return;
        }
        
        taskList.innerHTML = tasks.map(task => this.renderTaskItem(task)).join('');
        this.attachTaskEventListeners();
    },
    
    renderTaskItem(task) {
        const priorityColors = {
            high: '#f44336',
            medium: '#FF9800',
            low: '#4CAF50'
        };
        
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox-container">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                </div>
                
                <div class="task-content">
                    <div class="task-header">
                        <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
                        ${task.priority === 'high' ? '<span class="star-indicator"><i class="fas fa-flag"></i></span>' : ''}
                    </div>
                    
                    ${task.description ? `
                        <p class="task-description">${this.escapeHtml(task.description)}</p>
                    ` : ''}
                    
                    <div class="task-footer">
                        <div class="task-tags">
                            <span class="priority-badge" style="background: ${priorityColors[task.priority] || '#9e9e9e'}">
                                <i class="fas fa-flag"></i> ${task.priority}
                            </span>
                            
                            ${task.dueDate ? `
                                <span class="due-date ${isOverdue ? 'overdue' : ''}">
                                    <i class="fas fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            ` : ''}
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
    
    attachTaskEventListeners() {
        // Checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.closest('.task-item')?.dataset.taskId;
                if (taskId) {
                    TaskTrackerState.toggleTaskComplete(taskId);
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
                    if (confirm('Are you sure you want to delete this task?')) {
                        TaskTrackerState.deleteTask(taskId);
                    }
                }
            });
        });
    },
    
    renderStats() {
        const stats = TaskTrackerState.getStatistics();
        
        // Update sidebar stats
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
    
    renderNotifications() {
        TaskTrackerState.renderNotifications();
    },
    
    applyTheme() {
        const theme = TaskTrackerState.theme;
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
    
    openTaskModal(taskId = null) {
        const modal = document.getElementById('modal');
        if (!modal) return;
        
        let task = null;
        if (taskId) {
            task = TaskTrackerState.tasks.find(t => t.id === taskId);
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
                                <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${!task || task?.priority === 'medium' ? 'selected' : ''}>Medium</option>
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
                
                // Create task object
                const taskData = {
                    id: data.id || null,
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    dueDate: data.dueDate || null
                };
                
                // Save task
                TaskTrackerTasks.saveTask(taskData);
                
                // Close modal
                modal.classList.remove('active');
            });
        }
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};