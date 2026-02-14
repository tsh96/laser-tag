export interface LaserSettings {
    width: number
    height: number
    padding: number
    unit: 'mm' | 'cm' | 'in'
    isFlipped: boolean
    fontSize: number
    autoSize: boolean
}

export interface HistoryItem {
    id: string
    text: string
    settings: LaserSettings
    status: 'pending' | 'exported'
    timestamp: any
}

export interface Notification {
    id: number
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    timeout?: number
}
