import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import app from './app.js'
import { initStore } from './storage/store.js'
import { setupWebSocket } from './websocket/wsManager.js'

const PORT = process.env.PORT || 8760

initStore()

const server = createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

setupWebSocket(wss)

server.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`)
  console.log(`WebSocket ready on ws://localhost:${PORT}/ws`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app
