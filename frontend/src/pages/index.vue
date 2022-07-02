<template>
    <el-row justify="center">
        <el-col :span="12">
            <!-- <el-card> -->
                <!-- <el-row
                    class="mb-2"
                    justify="center"
                >
                    <video
                        ref="$player"
                        autoplay
                    />
                </el-row> -->
            <el-carousel
                :interval="10000"
                type="card"
                height="200px"
                trigger="click"
            >
                <el-carousel-item
                    v-for="item in 6"
                    :key="item"
                >
                    <h3
                        text="2xl"
                        justify="center"
                    >
                        {{ item }}
                    </h3>
                </el-carousel-item>
            </el-carousel>
            <el-row
                class="mt-6"
                justify="center"
            >
                <el-button
                    type="primary"
                    :icon="VideoCamera"
                    @click="broadcast"
                >
                    Become a Streamer
                </el-button>
                <el-button
                    :icon="VideoPlay"
                    @click="connect"
                >
                    View Content
                </el-button>
            </el-row>
            <!-- </el-card> -->
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
    import { onMounted, ref } from '#imports'
    import TonWeb from 'tonweb'
    import Payments from 'tonweb/src/contract/payments' 

    const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC'
    const providerApiKey = 'eb7febb199841f9b20a7f6ca161be09918c71c753d210cb30a46996815d8ca4d'
    const provider = new TonWeb.HttpProvider(providerUrl, { apiKey: providerApiKey })
    const tonweb = new TonWeb(provider)

    const toNano = TonWeb.utils.toNano
    const Address = TonWeb.utils.Address
    const BN = TonWeb.utils.BN

    import {
        ElRow,
        ElCol,
        ElCard,
        ElForm,
        ElButton,
        ElIcon,
        ElCarousel,
        ElCarouselItem
    } from 'element-plus'

    import {
        VideoCamera,
        VideoPlay
    } from '@element-plus/icons-vue'

    import { TonExt } from './tonext'
    import {
        userSignedIn,
        userDialogToggle
    } from '@/composables/signin'

    interface MySignKeyPair {
        publicKey: Uint8Array;
        secretKey: Uint8Array;
    }

    const $player = ref<HTMLVideoElement | null>(null)
    const peer = ref<RTCPeerConnection| null>(null)
    const ws = new WebSocket('ws://localhost:4000')

    function pubToPair(pub: Uint8Array): MySignKeyPair {
        return {
            publicKey: pub,
            secretKey: new Uint8Array(64)
        }
    }

    ws.addEventListener('open', () => {
        console.log('ws opened!')
    })

    ws.addEventListener('message', (event) => {
        try {
            const message = JSON.parse(event.data)
            const { method, data } = message


            switch (method) {
                case 'subscribe':
                    if (peer.value === null) {
                        return undefined
                    }

                    peer.value.setRemoteDescription(new RTCSessionDescription(data))
                        .catch(e => console.log(e))

                    break
                default:
                    console.error('unknown ws method')

                    break
            }

            console.log('received: ', event.data)
        } catch (err) {
            console.error('Cant parse ws answer: ', err, event.data)
        }
    })

    const connect = () => {
        if (!userSignedIn.value) return userDialogToggle()
        if ($player.value === null) return undefined
        if (ws.readyState !== 1) return undefined

        peer.value = createPeer(true)
        peer.value.addTransceiver('video', { direction: 'recvonly' })
    }

    const broadcast = async () => {
        if (!userSignedIn.value) return userDialogToggle()
        if ($player.value === null) return undefined
        if (ws.readyState !== 1) return undefined

        const stream = await navigator.mediaDevices.getUserMedia({ video: true })

        $player.value.srcObject = stream
        peer.value = createPeer()

        stream.getTracks().forEach(track => peer.value.addTrack(track, stream))
    } 

    const createPeer = (viewer = false): RTCPeerConnection => {
        const peer = new RTCPeerConnection({
            iceServers: [ {
                urls: 'stun:stun.stunprotocol.org'
            } ]
        })

        if (viewer) {
            peer.ontrack = (event) => {
                if ($player.value === null) return undefined

                $player.value.srcObject = event.streams[0]
            }
        }

        peer.onnegotiationneeded = async () => {
            const offer = await peer.createOffer()

            await peer.setLocalDescription(offer)

            const payload = {
                method: viewer ? 'subscribe2' : 'subscribe',
                data: peer.localDescription
            }

            ws.send(JSON.stringify(payload))
        }

        return peer
    }

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


        // получить гет методом публичный ключ кошелька Alice
        const alicePub = new Uint8Array(32)
        console.log(alicePub.length)

        const smcA = new Payments.PaymentChannel(provider, {
            isA: true, // Alice will open 
            channelId: new BN(1234),
            myKeyPair: pubToPair(alicePub),
            hisPublicKey: pubToPair(new Uint8Array(32)),
            initBalanceA: channelInitState.balanceA,
            initBalanceB: channelInitState.balanceB,
            addressA: tonext.address,
            addressB: bobAddress
        })

        console.log(await smcA.getAddress())
    })
</script>

<style scoped>
    .el-carousel__item h3 {
        color: #475669;
        opacity: 0.75;
        line-height: 200px;
        margin: 0;
        text-align: center;
    }

    .el-carousel__item:nth-child(2n) {
        background-color: #99a9bf;
    }

    .el-carousel__item:nth-child(2n + 1) {
        background-color: #d3dce6;
    }
</style>
