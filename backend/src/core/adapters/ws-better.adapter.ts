import { MessageMappingProperties } from '@nestjs/websockets'
import { WsAdapter } from '@nestjs/platform-ws'
import { Observable, EMPTY } from 'rxjs'

export class WsBetterAdapter extends WsAdapter {
    bindMessageHandler(
        buffer: any,
        handlers: MessageMappingProperties[],
        process: (data: any) => Observable<any>,
    ): Observable<any> {
        try {
            const message = JSON.parse(buffer.data)
            const handler = handlers.find(h => h.message === message.method)
    
            return handler
                ? process(handler.callback(message))
                : EMPTY
        } catch (error) {
            return EMPTY
        }
    }
}
