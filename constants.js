// constants.js

const Constants = {
    Priority: {
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low',
        NONE: 'none'
    },
    PriorityColors: {
        high: '#f44336',
        medium: '#FF9800',
        low: '#4CAF50',
        none: '#9e9e9e'
    },
    DefaultWorkspaces: [
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
    ],
    Views: {
        LIST: 'list',
        BOARD: 'board',
        CALENDAR: 'calendar'
    }
};