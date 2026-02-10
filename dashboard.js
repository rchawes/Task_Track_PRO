/*
 * Task Tracker Pro - Dashboard Module
 * Complete task management system with advanced features
 */

class TaskManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                          JSON.parse(sessionStorage.getItem('currentUser'));
        this.tasks = Storage.getTasks();
        this.workspaces = Storage.getWorkspaces().length ? Storage.getWorkspaces() : Constants.DefaultWorkspaces;
        this.currentWorkspace = this.workspaces[0]?.id || null;
        this.currentView = 'list';
        this.init();
    }
    
    init() {
        // Check authentication
        if (!this.currentUser) {
            window.location.href = 'auth.html';
            return;
        }
        
        // Initialize UI
        this.setupUI();
        this.loadUserData();
        this.setupEventListeners();
        this.loadTasks();
        this.updateStats();
    }
    
    setupUI() {
        // Set user info
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = this.currentUser.role;
        document.getElementById('userAvatar').textContent = this.currentUser.avatar;
        
        // Load workspaces
        this.loadWorkspaces();
        
        // Set dashboard title
        const workspace = this.workspaces.find(w => w.id === this.currentWorkspace);
        if (workspace) {
            document.getElementById('dashboardTitle').textContent = workspace.name;
        }
    }
    
    loadUserData() {
        // Load user-specific data
        const userData = JSON.parse(localStorage.getItem(`userData_${this.currentUser.id}`)) || {
            theme: 'light',
            notifications: true,
            defaultView: 'list'
        };
        
        // Apply theme
        document.body.classList.toggle('dark-theme', userData.theme === 'dark');
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = userData.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // View toggles
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.view-btn').dataset.view;
                this.switchView(view);
            });
        });
        
        // New task button
        document.getElementById('newTaskBtn').addEventListener('click', () => this.showTaskModal());
        
        // Quick add
        document.getElementById('quickAddBtn').addEventListener('click', () => this.quickAddTask());
        
        // Workspace management
        document.getElementById('addWorkspaceBtn').addEventListener('click', () => this.addWorkspace());
        
        // Search
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.searchTasks(e.target.value);
        });
        
        // Close sidebar
        document.querySelector('.close-sidebar').addEventListener('click', () => {
            document.getElementById('rightSidebar').classList.remove('open');
        });
        
        // Filter list
        document.querySelectorAll('.filter-list li').forEach(item => {
            item.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.textContent.trim());
            });
        });
    }
    
    toggleTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('#themeToggle i');
        
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            themeIcon.className = 'fas fa-moon';
            this.saveUserData({ theme: 'light' });
        } else {
            body.classList.add('dark-theme');
            themeIcon.className = 'fas fa-sun';
            this.saveUserData({ theme: 'dark' });
        }
    }
    
    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Show active view
        document.querySelectorAll('.view-content').forEach(content => {
            content.classList.toggle('active', content.id === `${view}View`);
        });
        
        // Load specific view content
        switch(view) {
            case 'list':
                this.loadListView();
                break;
            case 'board':
                this.loadBoardView();
                break;
            case 'calendar':
                this.loadCalendarView();
                break;
        }
        
        this.saveUserData({ defaultView: view });
    }
    
    loadListView() {
        const listView = document.getElementById('listView');
        const filteredTasks = this.getFilteredTasks();
        
        listView.innerHTML = `
            <div class="task-filters">
                <div class="filter-options">
                    <select id="sortBy" class="filter-select">
                        <option value="created">Created Date</option>
                        <option value="due">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="title">Title</option>
                    </select>
                    
                    <select id="priorityFilter" class="filter-select">
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    
                    <button class="btn btn-secondary" id="clearFilters">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-secondary" id="selectAll">
                        <i class="far fa-square"></i> Select All
                    </button>
                    <button class="btn btn-secondary" id="exportTasks">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
            
            <div class="task-list-container" id="taskListContainer">
                ${filteredTasks.length === 0 ? 
                    '<div class="empty-state"><i class="fas fa-tasks"></i><p>No tasks found. Create your first task!</p></div>' : 
                    filteredTasks.map(task => this.renderTaskItem(task)).join('')
                }
            </div>
        `;
        
        // Add event listeners for new elements
        document.getElementById('sortBy').addEventListener('change', (e) => this.sortTasks(e.target.value));
        document.getElementById('priorityFilter').addEventListener('change', (e) => this.filterByPriority(e.target.value));
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        document.getElementById('selectAll').addEventListener('click', () => this.toggleSelectAll());
        document.getElementById('exportTasks').addEventListener('click', () => this.exportTasks());
    }
    
    renderTaskItem(task) {
        const priorityColors = {
            high: '#f44336',
            medium: '#FF9800',
            low: '#4CAF50'
        };
        
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;
        const dueText = dueDate ? dueDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        }) : 'No due date';
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-id="${task.id}">
                <div class="task-select">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                </div>
                
                <div class="task-content">
                    <div class="task-header">
                        <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
                        <div class="task-meta">
                            ${task.priority !== 'none' ? 
                                `<span class="priority-badge" style="background: ${priorityColors[task.priority]}">
                                    <i class="fas fa-flag"></i> ${task.priority}
                                </span>` : ''
                            }
                            ${task.tags?.map(tag => 
                                `<span class="tag-badge">${tag}</span>`
                            ).join('') || ''}
                        </div>
                    </div>
                    
                    <p class="task-description">${this.escapeHtml(task.description || 'No description')}</p>
                    
                    <div class="task-footer">
                        <div class="task-info">
                            <span class="task-date ${isOverdue ? 'overdue' : ''}">
                                <i class="fas fa-calendar"></i> ${dueText}
                            </span>
                            ${task.assignee ? 
                                `<span class="task-assignee">
                                    <i class="fas fa-user"></i> ${task.assignee}
                                </span>` : ''
                            }
                        </div>
                        
                        <div class="task-actions">
                            <button class="icon-btn star-btn ${task.starred ? 'starred' : ''}" title="Star">
                                <i class="fas fa-star"></i>
                            </button>
                            <button class="icon-btn comment-btn" title="Comments">
                                <i class="fas fa-comment"></i>
                                ${task.comments?.length ? `<span class="badge">${task.comments.length}</span>` : ''}
                            </button>
                            <button class="icon-btn edit-btn" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="icon-btn delete-btn" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const isEdit = task !== null;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${isEdit ? 'Edit Task' : 'Create New Task'}</h2>
                    <button class="icon-btn close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="taskForm" class="task-form">
                    <div class="form-group">
                        <label for="taskTitle">Title *</label>
                        <input type="text" id="taskTitle" class="form-control" 
                               value="${task?.title || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="taskDescription">Description</label>
                        <textarea id="taskDescription" class="form-control" rows="3">${task?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskPriority">Priority</label>
                            <select id="taskPriority" class="form-control">
                                <option value="none" ${task?.priority === 'none' ? 'selected' : ''}>None</option>
                                <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${task?.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="taskDueDate">Due Date</label>
                            <input type="date" id="taskDueDate" class="form-control" 
                                   value="${task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskTags">Tags</label>
                            <input type="text" id="taskTags" class="form-control" 
                                   value="${task?.tags?.join(', ') || ''}" 
                                   placeholder="work, personal, urgent">
                            <small>Separate with commas</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="taskAssignee">Assignee</label>
                            <input type="text" id="taskAssignee" class="form-control" 
                                   value="${task?.assignee || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="taskWorkspace">Workspace</label>
                        <select id="taskWorkspace" class="form-control">
                            ${this.workspaces.map(ws => 
                                `<option value="${ws.id}" ${ws.id === (task?.workspaceId || this.currentWorkspace) ? 'selected' : ''}>
                                    ${ws.name}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Show modal
        modal.classList.add('active');
        
        // Add event listeners
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        });
        
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask(task?.id);
            modal.classList.remove('active');
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    saveTask(taskId = null) {
        const form = document.getElementById('taskForm');
        const isEdit = taskId !== null;
        
        const taskData = {
            id: isEdit ? taskId : this.generateId(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value || null,
            tags: document.getElementById('taskTags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag),
            assignee: document.getElementById('taskAssignee').value || null,
            workspaceId: document.getElementById('taskWorkspace').value,
            completed: false,
            starred: false,
            createdAt: isEdit ? this.tasks.find(t => t.id === taskId)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: this.currentUser.id
        };
        
        if (isEdit) {
            const index = this.tasks.findIndex(t => t.id === taskId);
            this.tasks[index] = { ...this.tasks[index], ...taskData };
        } else {
            this.tasks.unshift(taskData);
        }
        
        this.saveTasks();
        this.loadListView();
        this.updateStats();
        
        this.showNotification(
            isEdit ? 'Task updated successfully!' : 'Task created successfully!',
            'success'
        );
    }
    
    quickAddTask() {
        const title = prompt('Quick add task:');
        if (title && title.trim()) {
            const newTask = {
                id: this.generateId(),
                title: title.trim(),
                description: '',
                priority: 'none',
                dueDate: null,
                tags: [],
                assignee: null,
                workspaceId: this.currentWorkspace,
                completed: false,
                starred: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: this.currentUser.id
            };
            
            this.tasks.unshift(newTask);
            this.saveTasks();
            this.loadListView();
            this.updateStats();
            
            this.showNotification('Task added!', 'success');
        }
    }
    
    loadWorkspaces() {
        const workspaceList = document.getElementById('workspaceList');
        workspaceList.innerHTML = this.workspaces.map(ws => `
            <div class="workspace-item ${ws.id === this.currentWorkspace ? 'active' : ''}" data-id="${ws.id}">
                <div class="workspace-color" style="background: ${ws.color}"></div>
                <div class="workspace-info">
                    <div class="workspace-name">${ws.name}</div>
                    <div class="workspace-count">
                        ${this.tasks.filter(t => t.workspaceId === ws.id).length} tasks
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        workspaceList.querySelectorAll('.workspace-item').forEach(item => {
            item.addEventListener('click', () => {
                const workspaceId = item.dataset.id;
                this.currentWorkspace = workspaceId;
                this.loadWorkspaces();
                this.loadListView();
                
                const workspace = this.workspaces.find(w => w.id === workspaceId);
                if (workspace) {
                    document.getElementById('dashboardTitle').textContent = workspace.name;
                }
            });
        });
    }
    
    addWorkspace() {
        const name = prompt('Enter workspace name:');
        if (name && name.trim()) {
            const color = this.getRandomColor();
            const newWorkspace = {
                id: this.generateId(),
                name: name.trim(),
                color: color,
                createdAt: new Date().toISOString(),
                createdBy: this.currentUser.id
            };
            
            this.workspaces.push(newWorkspace);
            this.saveWorkspaces();
            this.loadWorkspaces();
        }
    }
    
    updateStats() {
        const totalTasks = this.tasks.length;
        const pendingTasks = this.tasks.filter(t => !t.completed).length;
        const overdueTasks = this.tasks.filter(t => 
            t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
        ).length;
        const highPriorityTasks = this.tasks.filter(t => t.priority === 'high').length;
        const completedTasks = totalTasks - pendingTasks;
        
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('overdueTasks').textContent = overdueTasks;
        document.getElementById('highPriorityTasks').textContent = highPriorityTasks;
        
        // Update summary
        document.getElementById('taskSummary').textContent = 
            `${totalTasks} tasks total • ${completedTasks} completed`;
    }
    
    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getRandomColor() {
        const colors = ['#4b6cb7', '#4CAF50', '#FF9800', '#9C27B0', '#f44336', '#2196F3'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    saveTasks() {
        localStorage.setItem('userTasks', JSON.stringify(this.tasks));
    }
    
    saveWorkspaces() {
        localStorage.setItem('workspaces', JSON.stringify(this.workspaces));
    }
    
    saveUserData(data) {
        const userData = JSON.parse(localStorage.getItem(`userData_${this.currentUser.id}`)) || {};
        const newData = { ...userData, ...data };
        localStorage.setItem(`userData_${this.currentUser.id}`, JSON.stringify(newData));
    }
    
    getFilteredTasks() {
        let filtered = this.tasks.filter(t => t.workspaceId === this.currentWorkspace);
        
        // Add additional filtering logic here
        
        return filtered;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            background-color: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    logout() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    }
    
    initDefaultWorkspaces() {
        return [
            {
                id: 'default',
                name: 'Personal',
                color: '#4b6cb7',
                createdAt: new Date().toISOString(),
                createdBy: 'system'
            },
            {
                id: 'work',
                name: 'Work',
                color: '#4CAF50',
                createdAt: new Date().toISOString(),
                createdBy: 'system'
            }
        ];
    }
}

// Initialize the task manager
const taskManager = new TaskManager();