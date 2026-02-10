// Task Management
const TaskTrackerTasks = {
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Event listeners will be set up by the main app
    },
    
    createTask(initialData = {}) {
        const user = TaskTrackerState.getState().user;
        
        return {
            id: 'task_' + Date.now(),
            title: '',
            description: '',
            priority: 'medium',
            dueDate: null,
            tags: [],
            completed: false,
            starred: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: user?.id || null,
            ...initialData
        };
    },
    
    saveTask(taskData) {
        try {
            if (!taskData.title || taskData.title.trim() === '') {
                TaskTrackerState.addNotification('Task title is required', 'error');
                return false;
            }
            
            const task = {
                ...taskData,
                title: taskData.title.trim(),
                description: taskData.description?.trim() || '',
                updatedAt: new Date().toISOString()
            };
            
            if (task.id && task.id.startsWith('task_')) {
                // Update existing task
                TaskTrackerState.updateTask(task.id, task);
                TaskTrackerState.addNotification('Task updated successfully', 'success');
            } else {
                // Create new task
                const newTask = this.createTask(task);
                TaskTrackerState.addTask(newTask);
                TaskTrackerState.addNotification('Task created successfully', 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('Save task error:', error);
            TaskTrackerState.addNotification('Failed to save task', 'error');
            return false;
        }
    },
    
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            TaskTrackerState.deleteTask(taskId);
            TaskTrackerState.addNotification('Task deleted', 'info');
        }
    },
    
    toggleTaskComplete(taskId) {
        TaskTrackerState.toggleTaskComplete(taskId);
        
        const task = TaskTrackerState.getState().tasks.find(t => t.id === taskId);
        if (task) {
            const status = task.completed ? 'completed' : 'marked as active';
            TaskTrackerState.addNotification(`Task "${task.title}" ${status}`, 'info');
        }
    },
    
    exportTasks() {
        const tasks = TaskTrackerState.getState().tasks;
        const data = {
            tasks,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        TaskTrackerState.addNotification('Tasks exported successfully', 'success');
    }
};