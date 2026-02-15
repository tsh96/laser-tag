export interface TextSpan {
    text: string
    fontFamily: string
    fontSize: number
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
    textDecoration?: 'none' | 'underline' | 'line-through'
}

export interface RichText {
    spans: TextSpan[]
}

export interface LaserSettings {
    width: number
    height: number
    padding: number
    unit: 'mm' | 'cm' | 'in'
    isFlipped: boolean
    fontSize: number
    autoSize: boolean
    useRichTextMode: boolean
    maxFontSize: number
}

export interface HistoryItem {
    id: string
    text: string
    richText?: RichText
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
