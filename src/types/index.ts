export type TriggerType = 'page_load' | 'click' | 'dwell' | 'timer'

export interface TriggerConfig {
  type: TriggerType
  delay: number
  dwellTime?: number
  timerInterval?: number
  clickSelector?: string
}

export interface PositionConfig {
  vertical: 'top' | 'center' | 'bottom'
  horizontal: 'left' | 'center' | 'right'
  offsetX: number
  offsetY: number
}

export interface CloseConfig {
  button: boolean
  mask: boolean
  timeout: number
  escape: boolean
}

export interface PopupStyle {
  width: number
  height: number | 'auto'
  borderRadius: number
  animation: 'fade' | 'slide' | 'scale' | 'spring'
  maskColor: string
  maskOpacity: number
  maskBlur: number
}

export interface PopupContent {
  title: string
  body: string
  imageUrl?: string
  confirmText?: string
  cancelText?: string
}

export interface PopupRule {
  id: string
  name: string
  enabled: boolean
  trigger: TriggerConfig
  position: PositionConfig
  close: CloseConfig
  style: PopupStyle
  content: PopupContent
  order: number
  createdAt: string
  updatedAt: string
}

export interface GlobalSettings {
  maskColor: string
  maskOpacity: number
  maskBlur: number
  maskCloseOnClick: boolean
  defaultPosition: PositionConfig
  defaultAnimation: 'fade' | 'slide' | 'scale' | 'spring'
  defaultWidth: number
  defaultHeight: number | 'auto'
  defaultBorderRadius: number
  theme: 'dark' | 'light'
  accentColor: string
}

export type WsMessageType = 'popup_show' | 'popup_close' | 'cycle_start' | 'cycle_step' | 'cycle_end' | 'log'

export interface WsMessage {
  type: WsMessageType
  data: {
    ruleId?: string
    ruleName?: string
    rule?: PopupRule
    timestamp: number
    details?: string
    stepIndex?: number
    totalSteps?: number
  }
}

export interface TriggerLog {
  id: string
  ruleId: string
  ruleName: string
  triggerType: TriggerType
  action: 'show' | 'close'
  timestamp: number
  details?: string
}

export interface CycleTestConfig {
  ruleIds: string[]
  interval: number
  repeat: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PopupState {
  visible: boolean
  rule: PopupRule | null
}
