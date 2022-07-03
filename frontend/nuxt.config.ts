import { defineNuxtConfig } from 'nuxt'
import { Buffer } from 'buffer'
import inject from '@rollup/plugin-inject'

const lifecycle = process.env.npm_lifecycle_event
const transpile = lifecycle === 'build' || lifecycle === 'generate'
    ? [ 'element-plus' ]
    : []

export default defineNuxtConfig({
    srcDir: './src',
    ssr: false,
    vite: {
        plugins: [
            inject({ Buffer: [ 'buffer', 'Buffer' ] })
        ],
        define: {
            'process.env.NODE_DEBUG': JSON.stringify(''),
            'process.browser': true
        },
        optimizeDeps: {
            include: [
                'buffer'
            ]
        }
    },
    meta: {
        title: 'TON Payments',
        meta: [
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            }, {
                hid: 'description',
                name: 'description',
                content: 'content',
            }
        ],
        link: [
            {
                rel: 'icon',
                type: 'image/x-icon',
                href: '/favicon.ico'
            }
        ]
    },
    css: [ '~/assets/scss/index.scss' ],
    build: {
        transpile
    },
    typescript: {
        strict: true,
        shim: false
    },
    modules: [
        '@vueuse/nuxt',
        '@unocss/nuxt',
        '@pinia/nuxt'
    ],
    components: true,
    vueuse: {
        ssrHandlers: true
    },
    unocss: {
        uno: true,
        attributify: true,
        icons: {
            scale: 1.2
        },
        shortcuts: [
            [
                'btn',
                'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'
            ]
        ]
    }
})
