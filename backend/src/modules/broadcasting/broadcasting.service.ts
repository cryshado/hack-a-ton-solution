import {
    Injectable,
    ConsoleLogger
} from '@nestjs/common'
import {
    RTCSessionDescription,
    RTCPeerConnection,
    MediaStream
} from 'werift'
import TonWeb, { AddressType } from 'tonweb'
import { WebSocketClient } from '@/core/ts/interfaces/websocket-client.interface'
import { WSWRTCRequest, WSWRTCResponse } from '@/core/ts/interfaces/wswrtc.interface'

interface Client {
    ws: WebSocketClient
    name: string
    address: AddressType
    isAuthorized: boolean
    peer?: RTCPeerConnection
}

interface Viewer {
    clientId: string
    state?: any
}

interface Room {
    ownerId: string
    price: string
    stream: MediaStream
    preview: string
    viewers: Client[]
}

const PEER_CONFIG = {
    iceServers: [ {
        urls: 'stun:stun.stunprotocol.org'
    } ]
}

@Injectable()
export class BroadcastingService {
    public clients: Map<string, Client> = new Map([])
    public rooms: Map<string, Room> = new Map([])
    private readonly logger = new ConsoleLogger(BroadcastingService.name)

    constructor () {}

    public async authorize (ws: WebSocketClient, request: WSWRTCRequest): Promise<WSWRTCResponse> {
        const { name, address } = request.data

        try {
            this.clients.set(ws.id, {
                ws,
                name,
                address: new TonWeb.Address(address),
                isAuthorized: true
            })

            return Promise.resolve({
                method: 'authorize',
                data: {
                    id: ws.id
                }
            })
        } catch (err) {
            return Promise.resolve({
                method: 'failed',
                data: null
            })
        }
    }

    public async start (ws: WebSocketClient, request: WSWRTCRequest): Promise<WSWRTCResponse> {
        const client = this.clients.get(ws.id)
        const { sdp, name, price } = request.data

        if (!client || !client.isAuthorized) {
            return Promise.resolve({
                method: 'failed',
                data: null,
                error: 'unauthorized'
            })
        }

        if (!sdp || !name || !price) {
            return Promise.resolve({
                method: 'failed',
                data: null,
                error: 'some fields are empty'
            })
        }

        if (this.rooms.get(name) !== undefined) {
            return Promise.resolve({
                method: 'failed',
                data: null,
                error: 'name is already in use'
            })
        }

        const room = {
            ownerId: ws.id,
            price,
            stream: null,
            preview: null,
            viewers: []
        }

        client.peer = new RTCPeerConnection(PEER_CONFIG)
        client.peer.ontrack = (e) => {
            room.stream = e.streams[0]
        }

        this.rooms.set(name, room)

        const description = await this.getPeerLocalDescription(client.peer, sdp)

        return Promise.resolve({
            method: 'start',
            data: { ...description }
        })
    }

    public async join (ws: WebSocketClient, request: WSWRTCRequest): Promise<WSWRTCResponse> {
        const client = this.clients.get(ws.id)
        const { sdp, name } = request.data

        if (!client || !client.isAuthorized) {
            return Promise.resolve({
                method: 'failed',
                data: null,
                error: 'unauthorized'
            })
        }

        if (!sdp || !name) {
            return Promise.resolve({
                method: 'failed',
                data: null,
                error: 'some fields are empty'
            })
        }

        const room = this.rooms.get(name)

        if (room === undefined) {
            return Promise.resolve({
                method: 'failed',
                data: null,
                error: 'cant find room'
            })
        }

        client.peer = new RTCPeerConnection(PEER_CONFIG)

        room.stream.getTracks().forEach(track => client.peer.addTrack(track, room.stream))
        room.viewers.push(client)

        const description = await this.getPeerLocalDescription(client.peer, sdp)

        return Promise.resolve({
            method: 'join',
            data: { ...description }
        })
    }

    public async getPeerLocalDescription (peer: RTCPeerConnection, sdp: string): Promise<RTCSessionDescription> {
        const description = new RTCSessionDescription(sdp, 'offer')

        await peer.setRemoteDescription(description)

        const answer = await peer.createAnswer()

        await peer.setLocalDescription(answer)

        return peer.localDescription
    }

    public onClientDisconnected (id: string): void {
        this.clients.delete(id)
    }
}
