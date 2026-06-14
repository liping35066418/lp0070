import { WebSocketServer, WebSocket } from 'ws'
import type { Server as HttpServer } from 'http'
import type { WsMessage, PopupRule, WsMessageType, TriggerLog } from '../../shared/types.js'

let wss: WebSocketServer | null = null

export function initWebSocket(server: HttpServer) {
  wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected')

    ws.send(
      JSON.stringify({
        type: 'log',
        data: { timestamp: Date.now(), details: '已连接到调度服务' },
      } as WsMessage),
    )

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString())
        console.log('Received ws message:', data)
      } catch (err) {
        console.error('Failed to parse ws message:', err)
      }
    })

    ws.on('close', () => {
      console.log('WebSocket client disconnected')
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  })

  console.log('WebSocket server initialized')
}

export function broadcast(message: WsMessage) {
  if (!wss) return
  const msgStr = JSON.stringify(message)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msgStr)
    }
  })
}

export function sendPopupShow(rule: PopupRule) {
  broadcast({
    type: 'popup_show',
    data: {
      ruleId: rule.id,
      ruleName: rule.name,
      rule,
      timestamp: Date.now(),
    },
  } as WsMessage)
}

export function sendPopupClose(ruleId: string, ruleName: string) {
  broadcast({
    type: 'popup_close',
    data: {
      ruleId,
      ruleName,
      timestamp: Date.now(),
    },
  } as WsMessage)
}

export function sendLog(details: string, ruleId?: string, ruleName?: string) {
  broadcast({
    type: 'log',
    data: {
      ruleId,
      ruleName,
      timestamp: Date.now(),
      details,
    },
  } as WsMessage)
}

export function sendCycleStart(totalSteps: number) {
  broadcast({
    type: 'cycle_start',
    data: {
      timestamp: Date.now(),
      totalSteps,
      details: `循环测试开始，共 ${totalSteps} 步`,
    },
  } as WsMessage)
}

export function sendCycleStep(rule: PopupRule, stepIndex: number, totalSteps: number) {
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
  } as WsMessage)
}

export function sendCycleEnd(totalSteps: number) {
  broadcast({
    type: 'cycle_end',
    data: {
      timestamp: Date.now(),
      totalSteps,
      details: `循环测试完成，共 ${totalSteps} 步`,
    },
  } as WsMessage)
}
