<template>
    <el-row justify="center">
        <el-col :span="6">
            <!-- <el-card> -->
                <el-row
                    class="mb-2"
                    justify="center"
                >
                    <el-button
                        type="primary"
                        :icon="VideoCamera"
                    >
                        Create Room
                    </el-button>
                </el-row>
                <el-row justify="center">
                    <el-button
                        type="primary"
                        :icon="User"
                    >
                        Join Room
                    </el-button>
                </el-row>
            <!-- </el-card> -->
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
    import { onMounted } from '#imports'
    import TonWeb from 'tonweb'

    import {
        ElRow,
        ElCol,
        ElCard,
        ElForm,
        ElButton,
        ElIcon
    } from 'element-plus'

    import {
        VideoCamera,
        User
    } from '@element-plus/icons-vue'

    import { TonExt } from './tonext'

    onMounted(async () => {
        const tonext = new TonExt(window)
        await tonext.init()

        console.log('addr.toString()', tonext.address.toString())

        const ws = new WebSocket('ws://localhost:4000');

        ws.addEventListener('open', () => {
            ws.send(JSON.stringify({ method: 'subscribe', data: 'test' }))
        })

        ws.addEventListener('message', (event) => {
            console.log('received: ', event.data)
        })
    })
</script>
