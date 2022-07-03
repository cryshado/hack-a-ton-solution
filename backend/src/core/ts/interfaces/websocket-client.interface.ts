import { WebSocket } from 'ws'

interface WebSocketClient extends WebSocket {
    id: string
    isAlive: boolean
}

export { WebSocketClient }
