/*
 * Event System - Centralized event handling
 */

class EventSystem {
    constructor() {
        this.handlers = new Map();
    }
    
    // Register event handler
    on(eventName, handler) {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName).push(handler);
        
        // Return unsubscribe function
        return () => {
            const handlers = this.handlers.get(eventName);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }
    
    // Remove event handler
    off(eventName, handler) {
        const handlers = this.handlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    // Trigger event
    emit(eventName, data = {}) {
        // Also dispatch as DOM event for global listeners
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
        
        // Call registered handlers
        const handlers = this.handlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                }
            });
        }
    }
    
    // One-time event listener
    once(eventName, handler) {
        const onceHandler = (data) => {
            handler(data);
            this.off(eventName, onceHandler);
        };
        this.on(eventName, onceHandler);
    }
}

// Create singleton instance
const eventSystem = new EventSystem();

// Export event constants
const Events = {
    // Auth events
    AUTH_LOGIN: 'auth:login',
    AUTH_LOGOUT: 'auth:logout',
    AUTH_REGISTER: 'auth:register',
    
    // Task events
    TASK_CREATE: 'task:create',
    TASK_UPDATE: 'task:update',
    TASK_DELETE: 'task:delete',
    TASK_TOGGLE: 'task:toggle',
    TASK_EDIT: 'task:edit',
    TASK_SAVE: 'task:save',
    
    // Filter events
    FILTER_CHANGE: 'filter:change',
    FILTER_CLEAR: 'filter:clear',
    SEARCH_CHANGE: 'search:change',
    
    // UI events
    THEME_TOGGLE: 'theme:toggle',
    MODAL_OPEN: 'modal:open',
    MODAL_CLOSE: 'modal:close',
    NOTIFICATION_SHOW: 'notification:show',
    NOTIFICATION_CLOSE: 'notification:close',
    
    // Data events
    DATA_LOAD: 'data:load',
    DATA_SAVE: 'data:save',
    
    // App events
    APP_READY: 'app:ready',
    APP_ERROR: 'app:error'
};

export { eventSystem, Events };