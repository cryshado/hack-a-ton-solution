import {
    MessageBody,
    SubscribeMessage,
    ConnectedSocket,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets'
import { RTCSessionDescription } from 'werift'
import { Server, ServerOptions } from 'ws'
import { WSWRTCRequest, WSWRTCResponse } from '@/core/ts/interfaces/wswrtc.interface'
import { WebSocketClient } from '@/core/ts/interfaces/websocket-client.interface'
import { BroadcastingService } from '@/modules/broadcasting/broadcasting.service'
import { randomBytes } from 'crypto'
import { Observable, from, mergeMap } from 'rxjs'

function heartbeat() {
    this.isAlive = true
}

@WebSocketGateway(0, { path: '/' } as ServerOptions)
export class BroadcastingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor (private readonly broadcasting: BroadcastingService) {}

    @WebSocketServer()
    server: Server

    @SubscribeMessage('authorize')
    onAuthorize (
        @ConnectedSocket() ws: WebSocketClient,
        @MessageBody() request: WSWRTCRequest
    ): Observable<WSWRTCResponse> {
        return from(this.broadcasting.authorize(ws, request))
    }

    @SubscribeMessage('start')
    onStart (
        @ConnectedSocket() ws: WebSocketClient,
        @MessageBody() request: WSWRTCRequest
    ): Observable<WSWRTCResponse> {
        return from(this.broadcasting.start(ws, request))
    }

    @SubscribeMessage('join')
    onJoin (
        @ConnectedSocket() ws: WebSocketClient,
        @MessageBody() request: WSWRTCRequest
    ): Observable<WSWRTCResponse> {
        return from(this.broadcasting.join(ws, request))
    }

    afterInit (): void {
        // setInterval(() => {
        //     this.broadcasting.clients.forEach(({ ws }) => {
        //         if (ws.isAlive === false) return ws.terminate()

        //         ws.isAlive = false
        //         ws.ping()
        //     })
        // }, 5000)
    }

    handleConnection (ws: WebSocketClient): void {
        const id = randomBytes(16).toString('hex')

        ws.id = id
        ws.isAlive = true
        // ws.on('pong', heartbeat)

        // setTimeout(() => {
        //     const client = this.broadcasting.clients.get(id)

        //     if (!client || !client.isAuthorized) {
        //         ws.off('pong', heartbeat)
        //         ws.terminate()
        //     }
        // }, 5000)
    }

    handleDisconnect (ws: WebSocketClient): void {
        this.broadcasting.onClientDisconnected(ws.id)

        // ws.off('pong', heartbeat)
    }
}
