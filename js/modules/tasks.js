/*
 * Task Management Module
 */

import { appState } from '../core/state.js';
import { eventSystem, Events } from '../core/events.js';

class TaskManager {
    constructor() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventSystem.on(Events.TASK_CREATE, () => this.createTask());
        eventSystem.on(Events.TASK_SAVE, (data) => this.saveTask(data));
        eventSystem.on(Events.TASK_EDIT, (data) => this.editTask(data.taskId));
        eventSystem.on(Events.TASK_DELETE, (data) => this.deleteTask(data.taskId));
        eventSystem.on(Events.TASK_TOGGLE, (data) => this.toggleTaskComplete(data.taskId));
    }
    
    createTask(initialData = {}) {
        const user = appState.getState().user;
        
        return {
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
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
            workspaceId: appState.getState().currentWorkspace,
            ...initialData
        };
    }
    
    saveTask(taskData) {
        try {
            if (!taskData.title || taskData.title.trim() === '') {
                appState.addNotification('Task title is required', 'error');
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
                appState.updateTask(task.id, task);
                appState.addNotification('Task updated successfully', 'success');
            } else {
                // Create new task
                const newTask = this.createTask(task);
                appState.addTask(newTask);
                appState.addNotification('Task created successfully', 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('Save task error:', error);
            appState.addNotification('Failed to save task', 'error');
            return false;
        }
    }
    
    editTask(taskId) {
        const task = appState.getState().tasks.find(t => t.id === taskId);
        if (task) {
            eventSystem.emit(Events.MODAL_OPEN, {
                type: 'task',
                data: task
            });
        }
    }
    
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            appState.deleteTask(taskId);
            appState.addNotification('Task deleted', 'info');
        }
    }
    
    toggleTaskComplete(taskId) {
        appState.toggleTaskComplete(taskId);
        
        const task = appState.getState().tasks.find(t => t.id === taskId);
        if (task) {
            const status = task.completed ? 'completed' : 'marked as active';
            appState.addNotification(`Task "${task.title}" ${status}`, 'info');
        }
    }
    
    getTasks(filterOptions = {}) {
        return appState.getFilteredTasks();
    }
    
    getTaskStats() {
        return appState.getTaskStatistics();
    }
    
    searchTasks(query) {
        appState.setFilter('search', query);
    }
    
    setPriorityFilter(priority) {
        appState.setFilter('priority', priority);
    }
    
    setStatusFilter(status) {
        appState.setFilter('status', status);
    }
    
    exportTasks() {
        const tasks = appState.getState().tasks;
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
        
        appState.addNotification('Tasks exported successfully', 'success');
    }
    
    importTasks(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!data.tasks || !Array.isArray(data.tasks)) {
                        throw new Error('Invalid file format');
                    }
                    
                    // Add imported tasks
                    data.tasks.forEach(taskData => {
                        const task = this.createTask({
                            ...taskData,
                            id: undefined // Generate new ID
                        });
                        appState.addTask(task);
                    });
                    
                    appState.addNotification(`${data.tasks.length} tasks imported successfully`, 'success');
                    resolve(true);
                    
                } catch (error) {
                    appState.addNotification('Failed to import tasks: ' + error.message, 'error');
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                appState.addNotification('Failed to read file', 'error');
                reject(new Error('File read error'));
            };
            
            reader.readAsText(file);
        });
    }
}

// Create and export singleton
const taskManager = new TaskManager();
export default taskManager;