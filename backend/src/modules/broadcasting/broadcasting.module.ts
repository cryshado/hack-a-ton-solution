import { Module } from '@nestjs/common'
import { BroadcastingGateway } from '@/modules/broadcasting/broadcasting.gateway'
import { BroadcastingService } from '@/modules/broadcasting/broadcasting.service'

@Module({
    providers: [
        BroadcastingService,
        BroadcastingGateway
    ],
    exports: [
        BroadcastingService
    ]
})

export class BroadcastingModule {}
