// Task Management - Working Version
const TaskTrackerTasks = {
    init() {
        console.log('Tasks module initialized');
    },
    
    createTask(data = {}) {
        return {
            id: 'task_' + Date.now(),
            title: '',
            description: '',
            priority: 'medium',
            dueDate: null,
            tags: [],
            completed: false,
            createdAt: new Date().toISOString(),
            ...data
        };
    },
    
    saveTask(taskData) {
        if (!taskData.title || taskData.title.trim() === '') {
            TaskTrackerState.showNotification('Task title is required', 'error');
            return false;
        }
        
        if (taskData.id && taskData.id.startsWith('task_')) {
            // Update existing task
            TaskTrackerState.updateTask(taskData.id, taskData);
        } else {
            // Create new task
            TaskTrackerState.addTask(taskData);
        }
        
        return true;
    },
    
    exportTasks() {
        const tasks = TaskTrackerState.tasks;
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
        
        TaskTrackerState.showNotification('Tasks exported successfully', 'success');
    }
};