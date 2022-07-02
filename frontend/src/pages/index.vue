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

    const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC'
    const providerApiKey = 'eb7febb199841f9b20a7f6ca161be09918c71c753d210cb30a46996815d8ca4d'

    const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl, { apiKey: providerApiKey }))

    const toNano = TonWeb.utils.toNano
    const Address = TonWeb.utils.Address
    const BN = TonWeb.utils.BN

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

        // A (Alice)    - user
        // B (Bob)      - streamer

        // how much alice is willing to spend on the streamer 
        const aliceAmount = '2.5' // in TON
        const bobAddress = new Address('EQD85CtgkwdmFF-0lAyPFbzk0yaM48PmXOiJ42sEtIW_hI8H')

        const channelInitState = {
            balanceA: toNano(aliceAmount),  // Next A will need to make a top-up for this amount
            balanceB: toNano('0'),          // Streamer does not pay
            seqnoA: new BN(0),
            seqnoB: new BN(0)
        }

        const channelConfig = {
            channelId: new BN(1234), 
            addressA: tonext.address,
            addressB: bobAddress,
            initBalanceA: channelInitState.balanceA,
            initBalanceB: channelInitState.balanceB
        }

        const channelA = tonweb.payments.createChannel({
            ...channelConfig,
            isA: true,
            myKeyPair: keyPairA,
            hisPublicKey: keyPairB.publicKey,
        });

        const ws = new WebSocket('ws://localhost:4000');

        ws.addEventListener('open', () => {
            ws.send(JSON.stringify({ method: 'subscribe', data: 'test' }))
        })

        ws.addEventListener('message', (event) => {
            console.log('received: ', event.data)
        })
    })
</script>
