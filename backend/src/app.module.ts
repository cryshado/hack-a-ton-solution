import { Module } from '@nestjs/common'
import { BroadcastingModule } from '@/modules/broadcasting/broadcasting.module'

@Module({
    imports: [
        BroadcastingModule
    ]
})

export class AppModule {}
