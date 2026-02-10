/*
 * UI Module - Handles all UI rendering
 */

import { appState } from '../core/state.js';
import { eventSystem, Events } from '../core/events.js';

class UIManager {
    constructor() {
        this.subscriptions = [];
        this.debounceTimers = new Map();
        this.setup();
    }
    
    setup() {
        // Subscribe to state changes
        this.subscriptions.push(
            appState.subscribe((oldState, newState) => this.onStateChange(oldState, newState))
        );
        
        // Listen to UI events
        this.setupEventListeners();
        
        // Initialize UI
        this.initUI();
    }
    
    setupEventListeners() {
        eventSystem.on(Events.THEME_TOGGLE, () => this.toggleTheme());
        eventSystem.on(Events.MODAL_OPEN, (data) => this.openModal(data.type, data.data));
        eventSystem.on(Events.MODAL_CLOSE, () => this.closeModal());
        eventSystem.on(Events.FILTER_CHANGE, (data) => this.updateFilters(data));
        eventSystem.on(Events.SEARCH_CHANGE, (data) => this.updateSearch(data.query));
    }
    
    initUI() {
        // Apply saved theme
        const { theme } = appState.getState().ui;
        this.applyTheme(theme);
        
        // Render initial UI
        this.renderTaskList();
        this.updateStats();
        this.updateUserInfo();
    }
    
    onStateChange(oldState, newState) {
        // Theme changes
        if (oldState.ui.theme !== newState.ui.theme) {
            this.applyTheme(newState.ui.theme);
        }
        
        // Task changes
        if (oldState.tasks !== newState.tasks || 
            oldState.filters !== newState.filters ||
            oldState.currentWorkspace !== newState.currentWorkspace) {
            this.renderTaskList();
            this.updateStats();
        }
        
        // User changes
        if (oldState.user !== newState.user) {
            this.updateUserInfo();
        }
        
        // Modal changes
        if (oldState.ui.modal !== newState.ui.modal) {
            this.updateModal(newState.ui.modal);
        }
        
        // Loading state
        if (oldState.ui.loading !== newState.ui.loading) {
            this.updateLoading(newState.ui.loading);
        }
        
        // Notifications
        if (oldState.ui.notifications !== newState.ui.notifications) {
            this.renderNotifications(newState.ui.notifications);
        }
    }
    
    // Theme Management
    applyTheme(theme) {
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
    }
    
    toggleTheme() {
        const { theme } = appState.getState().ui;
        const newTheme = theme === 'light' ? 'dark' : 'light';
        appState.setState({
            ui: { ...appState.getState().ui, theme: newTheme }
        });
    }
    
    // Task List Rendering
    renderTaskList() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        const tasks = appState.getFilteredTasks();
        
        if (tasks.length === 0) {
            taskList.innerHTML = this.renderEmptyState();
            return;
        }
        
        taskList.innerHTML = tasks.map(task => this.renderTaskItem(task)).join('');
        
        // Attach event listeners
        this.attachTaskEventListeners();
    }
    
    renderTaskItem(task) {
        const priorityColors = {
            high: '#f44336',
            medium: '#FF9800',
            low: '#4CAF50',
            none: '#9e9e9e'
        };
        
        const priorityClass = `priority-${task.priority}`;
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
                                <span class="priority-badge ${priorityClass}" style="background: ${priorityColors[task.priority]}">
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
                            <button class="btn-icon star-btn" title="Star task">
                                <i class="fas fa-star${task.starred ? '' : '-o'}"></i>
                            </button>
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
    }
    
    renderEmptyState() {
        const { filters } = appState.getState();
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
                    <button class="btn btn-secondary" onclick="window.TaskTrackerApp.getModule('ui').clearFilters()">
                        Clear filters
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    attachTaskEventListeners() {
        // Checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.closest('.task-item')?.dataset.taskId;
                if (taskId) {
                    eventSystem.emit(Events.TASK_TOGGLE, { taskId });
                }
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item')?.dataset.taskId;
                if (taskId) {
                    eventSystem.emit(Events.TASK_EDIT, { taskId });
                }
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item')?.dataset.taskId;
                if (taskId) {
                    eventSystem.emit(Events.TASK_DELETE, { taskId });
                }
            });
        });
        
        // Star buttons
        document.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item')?.dataset.taskId;
                if (taskId) {
                    const task = appState.getState().tasks.find(t => t.id === taskId);
                    if (task) {
                        appState.updateTask(taskId, { starred: !task.starred });
                    }
                }
            });
        });
    }
    
    // Stats Display
    updateStats() {
        const stats = appState.getTaskStatistics();
        
        // Update stat cards
        document.getElementById('totalTasks')?.textContent = stats.total;
        document.getElementById('completedTasks')?.textContent = stats.completed;
        document.getElementById('pendingTasks')?.textContent = stats.pending;
        document.getElementById('overdueTasks')?.textContent = stats.overdue;
        
        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${stats.completionRate}%`;
            progressBar.textContent = `${stats.completionRate}%`;
        }
        
        // Update summary
        const summary = document.getElementById('taskSummary');
        if (summary) {
            summary.textContent = `${stats.total} tasks • ${stats.completed} completed • ${stats.overdue} overdue`;
        }
    }
    
    // User Info
    updateUserInfo() {
        const user = appState.getState().user;
        
        if (user) {
            document.getElementById('userName')?.textContent = user.name;
            document.getElementById('userEmail')?.textContent = user.email;
            
            // Update avatar
            const avatar = document.getElementById('userAvatar');
            if (avatar && user.avatar) {
                if (user.avatar.initials) {
                    avatar.textContent = user.avatar.initials;
                    avatar.style.backgroundColor = user.avatar.color;
                }
            }
        }
    }
    
    // Modal Management
    updateModal(modalData) {
        const modal = document.getElementById('modal');
        if (!modal) return;
        
        if (modalData) {
            modal.classList.add('active');
            modal.innerHTML = this.renderModal(modalData.type, modalData.data);
            this.attachModalEventListeners();
        } else {
            modal.classList.remove('active');
        }
    }
    
    renderModal(type, data) {
        switch (type) {
            case 'task':
                return this.renderTaskModal(data);
            case 'settings':
                return this.renderSettingsModal(data);
            default:
                return '<div>Modal content not found</div>';
        }
    }
    
    renderTaskModal(task = {}) {
        const isEdit = !!task.id;
        const dueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
        
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Edit Task' : 'Create New Task'}</h3>
                    <button class="btn-icon modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form class="modal-form" id="taskForm">
                    <input type="hidden" name="id" value="${task.id || ''}">
                    
                    <div class="form-group">
                        <label for="taskTitle">Title *</label>
                        <input type="text" id="taskTitle" name="title" value="${task.title || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="taskDescription">Description</label>
                        <textarea id="taskDescription" name="description" rows="3">${task.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskPriority">Priority</label>
                            <select id="taskPriority" name="priority">
                                <option value="none" ${task.priority === 'none' ? 'selected' : ''}>None</option>
                                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="taskDueDate">Due Date</label>
                            <input type="date" id="taskDueDate" name="dueDate" value="${dueDate}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="taskTags">Tags (comma separated)</label>
                        <input type="text" id="taskTags" name="tags" value="${task.tags?.join(', ') || ''}">
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
    }
    
    attachModalEventListeners() {
        // Close button
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                eventSystem.emit(Events.MODAL_CLOSE);
            });
        });
        
        // Form submission
        const form = document.getElementById('taskForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Parse tags
                if (data.tags) {
                    data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                }
                
                eventSystem.emit(Events.TASK_SAVE, data);
            });
        }
        
        // Close on overlay click
        const modal = document.getElementById('modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    eventSystem.emit(Events.MODAL_CLOSE);
                }
            });
        }
    }
    
    openModal(type, data = {}) {
        appState.openModal(type, data);
    }
    
    closeModal() {
        appState.closeModal();
    }
    
    // Search and Filters
    updateSearch(query) {
        appState.setFilter('search', query);
    }
    
    updateFilters(filters) {
        Object.entries(filters).forEach(([key, value]) => {
            appState.setFilter(key, value);
        });
    }
    
    clearFilters() {
        appState.clearFilters();
        appState.addNotification('Filters cleared', 'info');
    }
    
    // Notifications
    renderNotifications(notifications) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;
        
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
                appState.removeNotification(id);
            });
        });
    }
    
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'bell';
        }
    }
    
    // Loading State
    updateLoading(loading) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('active', loading);
        }
    }
    
    // Utility Methods
    formatDate(date) {
        const now = new Date();
        const taskDate = new Date(date);
        const diffTime = Math.abs(now - taskDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return taskDate.toLocaleDateString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Cleanup
    destroy() {
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions = [];
    }
}

// Create and export singleton
const ui = new UIManager();
export default ui;