import { NestFactory } from '@nestjs/core'
import {
    FastifyAdapter as Adapter,
    NestFastifyApplication as Application
} from '@nestjs/platform-fastify'
import { WsBetterAdapter } from '@/core/adapters/ws-better.adapter'
import { AppModule } from '@/app.module'
import 'reflect-metadata'

declare const module: any

const HOSTNAME = '0.0.0.0'
const PORT = 4000
const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production'

const enableHmr = (app: Application): void => {
    if (!module.hot) return undefined

    module.hot.accept()
    module.hot.dispose(() => app.close())

    return undefined
}

const bootstrap = async () => {
    const adapter = new Adapter({ logger: false, ignoreTrailingSlash: true })
    const app = await NestFactory.create<Application>(AppModule, adapter)

    // Enable websockets
    app.useWebSocketAdapter(new WsBetterAdapter(app))

    app.enableShutdownHooks()

    await app.listen(PORT, HOSTNAME)

    // enable HMR for dev purposes
    if (!IS_PRODUCTION) {
        enableHmr(app)
    }
}

bootstrap()
