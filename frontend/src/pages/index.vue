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
    import { generateMnemonic, mnemonicToKeyPair } from 'tonweb-mnemonic'

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
    import { WalletV3ContractR1 } from 'tonweb/dist/types/contract/wallet/v3/wallet-v3-contract-r1'

    const $player = ref<HTMLVideoElement | null>(null)
    const peer = ref<RTCPeerConnection| null>(null)
    const ws = new WebSocket('ws://localhost:4000')

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

    const sleep = (milliseconds: number): Promise<any> => new Promise(
        (resolve) => { setTimeout(resolve, milliseconds) }
    )

    type seqnoType = number | null | undefined

    async function waitForSeqno (
        initSeqno: number, 
        wallet: WalletV3ContractR1
    ): Promise<number> {
        while (true) {
            let seqno: seqnoType
            try {
                seqno = await wallet.methods.seqno().call()
            } catch (_) { 
                continue 
            }

            if (seqno !== null && seqno !== undefined) {
                if (seqno > initSeqno) { 
                    await sleep(5000)
                    return seqno; 
                }
            }

            await sleep(1000) // ms
        }
    }

    async function getSeqno(wallet: WalletV3ContractR1): Promise<number> {
        let seqno: seqnoType = await wallet.methods.seqno().call()

        if (seqno === null || seqno === undefined) { 
            seqno = 0
        }

        return seqno
    }

    onMounted(async () => {
        // A (Alice)    - user
        const aliceMnemonic = [
            'mystery', 'label', 'pulp', 'kitchen', 'prison', 'system', 'warrior', 'question', 
            'logic', 'sense', 'fantasy', 'genius', 'essay', 'olive', 'frown', 'three', 'among', 
            'palace', 'magic', 'affair', 'come', 'armor', 'comfort', 'salmon'
        ]

        // B (Bob)      - streamer
        const bobMnemonic = [
            'fury', 'quantum', 'ski', 'best', 'rose', 'shoe', 'secret', 'wide', 'cash', 'shrimp', 
            'yard', 'scissors', 'slab', 'property', 'stem', 'buyer', 'satisfy', 'often', 'remind', 
            'oxygen', 'laugh', 'unaware', 'sponsor', 'radar'
        ]

        const aliceKeyPair = await mnemonicToKeyPair(aliceMnemonic);
        const bobKeyPair = await mnemonicToKeyPair(bobMnemonic);

        // how much alice is willing to spend on the streamer 
        const aliceAmount = '2.5' // in TON
        const bobAddress = new Address('EQD85CtgkwdmFF-0lAyPFbzk0yaM48PmXOiJ42sEtIW_hI8H')
        
        const walletA = tonweb.wallet.create({ publicKey: aliceKeyPair.publicKey })
        const walletAddressAlice = await walletA.getAddress()
        console.log('walletAddressAlice:    ', walletAddressAlice.toString(true, true, true))

        const walletB = tonweb.wallet.create({ publicKey: bobKeyPair.publicKey })
        const walletAddressBob = await walletB.getAddress()
        console.log('walletAddressBob:      ', walletAddressBob.toString(true, true, true))
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
