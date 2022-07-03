import TonWeb, { AddressType } from 'tonweb-fix'

class TonExt {
    private _win: Window & typeof globalThis
    private _address: AddressType 

    constructor (win: Window & typeof globalThis) {
        this._win = win
        this._address = ''
    }

    public async init(): Promise<void> {
        const addrStr = (await this._win.ton.send('ton_requestAccounts'))[0]
        this._address = new TonWeb.Address(addrStr)
    }

    public async getBalance(): Promise<number> {
        return await this._win.ton.send('ton_getBalance')
    }

    public async sendTransaction(
        amountNano: number, 
        address: string, 
        b64Boc?: string
    ): Promise<void> {
        let data: { value: number, to: string, dataType?: 'boc', boc?: string } = {
            value: amountNano,
            to: address
        }

        if (b64Boc) {
            data.dataType = 'boc'
            data.boc = b64Boc
        }

        // TODO: it maybe return some data after user sign transaction
        await this._win.ton.send('ton_sendTransaction', [ data ])
    }

    public get address () { return this._address }
}

export { TonExt }
