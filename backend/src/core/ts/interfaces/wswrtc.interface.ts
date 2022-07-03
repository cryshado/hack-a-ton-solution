import { RTCSessionDescription, RTCPeerConnection, MediaStream } from 'werift'

interface WSWRTCRequest {
    method: 'subscribe' | 'authorize'
    data: any
}

interface WSWRTCResponse {
    method: 'authorize' | 'start' | 'join' | 'failed'
    data: any
    error?: any
}

export { WSWRTCRequest, WSWRTCResponse }
