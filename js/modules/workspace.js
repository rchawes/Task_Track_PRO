/*
 * Workspace Module
 */

import { appState } from '../core/state.js';
import { eventSystem, Events } from '../core/events.js';

class WorkspaceManager {
    constructor() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventSystem.on('workspace:switch', (data) => this.switchWorkspace(data.workspaceId));
        eventSystem.on('workspace:create', (data) => this.createWorkspace(data));
        eventSystem.on('workspace:delete', (data) => this.deleteWorkspace(data.workspaceId));
    }
    
    getWorkspaces() {
        return appState.getState().workspaces;
    }
    
    getCurrentWorkspace() {
        const { workspaces, currentWorkspace } = appState.getState();
        return workspaces.find(w => w.id === currentWorkspace) || workspaces[0];
    }
    
    switchWorkspace(workspaceId) {
        appState.setState({ currentWorkspace: workspaceId });
        appState.addNotification(`Switched workspace`, 'info');
    }
    
    createWorkspace(data) {
        const { name, color = this.getRandomColor() } = data;
        
        if (!name || name.trim() === '') {
            appState.addNotification('Workspace name is required', 'error');
            return false;
        }
        
        const workspace = {
            id: 'workspace_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            color,
            createdAt: new Date().toISOString()
        };
        
        const workspaces = [...appState.getState().workspaces, workspace];
        appState.setState({ workspaces });
        
        appState.addNotification(`Workspace "${name}" created`, 'success');
        return true;
    }
    
    deleteWorkspace(workspaceId) {
        const workspaces = appState.getState().workspaces.filter(w => w.id !== workspaceId);
        
        // Also filter tasks from this workspace
        const tasks = appState.getState().tasks.filter(t => t.workspaceId !== workspaceId);
        
        appState.setState({ workspaces, tasks });
        appState.addNotification('Workspace deleted', 'info');
    }
    
    getRandomColor() {
        const colors = ['#4b6cb7', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3', '#795548'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Create and export singleton
const workspaceManager = new WorkspaceManager();
export default workspaceManager;