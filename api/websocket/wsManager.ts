import { WebSocketServer, WebSocket } from 'ws'
import type {
  WsMessage,
  PopupRule,
} from '../types/index.js'

let wss: WebSocketServer | null = null

export function setupWebSocket(wssInstance: WebSocketServer): void {
  wss = wssInstance

  wss.on('connection', (ws) => {
    console.log('[WebSocket] 客户端已连接')

    ws.send(
      JSON.stringify({
        type: 'log',
        data: { timestamp: Date.now(), details: '已连接到调度服务' },
      } as WsMessage),
    )

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString())
        console.log('[WebSocket] 收到消息:', data)
      } catch (err) {
        console.error('[WebSocket] 消息解析失败:', err)
      }
    })

    ws.on('close', () => {
      console.log('[WebSocket] 客户端已断开')
    })

    ws.on('error', (error) => {
      console.error('[WebSocket] 错误:', error)
    })
  })

  console.log('[WebSocket] 服务器已初始化')
}

export function broadcast(message: WsMessage): void {
  if (!wss) return
  const msgStr = JSON.stringify(message)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msgStr)
    }
  })
}

export function sendPopupShow(rule: PopupRule): void {
  broadcast({
    type: 'popup_show',
    data: {
      ruleId: rule.id,
      ruleName: rule.name,
      rule,
      timestamp: Date.now(),
    },
  })
}

export function sendPopupClose(ruleId: string, ruleName: string): void {
  broadcast({
    type: 'popup_close',
    data: {
      ruleId,
      ruleName,
      timestamp: Date.now(),
    },
  })
}

export function sendLog(details: string, ruleId?: string, ruleName?: string): void {
  broadcast({
    type: 'log',
    data: {
      ruleId,
      ruleName,
      timestamp: Date.now(),
      details,
    },
  })
}

export function sendCycleStart(totalSteps: number): void {
  broadcast({
    type: 'cycle_start',
    data: {
      timestamp: Date.now(),
      totalSteps,
      details: `循环测试开始，共 ${totalSteps} 步`,
    },
  })
}

export function sendCycleStep(
  rule: PopupRule,
  stepIndex: number,
  totalSteps: number,
): void {
  broadcast({
    type: 'cycle_step',
    data: {
      ruleId: rule.id,
      ruleName: rule.name,
      rule,
      timestamp: Date.now(),
      stepIndex,
      totalSteps,
      details: `第 ${stepIndex + 1} / ${totalSteps} 步：${rule.name}`,
    },
  })
}

export function sendCycleEnd(totalSteps: number): void {
  broadcast({
    type: 'cycle_end',
    data: {
      timestamp: Date.now(),
      totalSteps,
      details: `循环测试完成，共 ${totalSteps} 步`,
    },
  })
}

export function getClientCount(): number {
  if (!wss) return 0
  let count = 0
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      count++
    }
  })
  return count
}
