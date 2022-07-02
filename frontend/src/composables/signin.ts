import {
    ref,
    reactive,
    computed
} from '#imports'

import TonWeb, { AddressType } from 'tonweb'
import type { FormInstance } from 'element-plus'

const $userForm = ref<FormInstance | null>(null)


const validateMnemonic = (_rule: any, value: string, callback: any) => {
    const mnemonic = value ? value.trim().replace(/[\s]+/g, ' ').split(' ') : []

    if (mnemonic.length !== 24) {
        return callback(new Error('Please input 24 words from mnemonic phrase.'))
    }

    callback()
}

const userSignIn = (form: FormInstance | undefined) => {
    console.log(form)
    if (!form) return undefined

    form.validate((isValid) => {
        console.log('val', isValid)
        if (!isValid) return false

        userState.mnemonic = userForm.mnemonic.trim().replace(/[\s]+/g, ' ').split(' ')
    })
}

const userDialogToggle = () => {
    if (userSignedIn.value) return undefined

    userDialog.value = true
}

const userDialog = ref(false)

const userForm = reactive({
    mnemonic: ''
})

const userRules = reactive({
    mnemonic: [ { validator: validateMnemonic, trigger: 'blur' } ]
})

const userState = reactive({
    address: '123',
    mnemonic: [ '' ]
})

const userSignedIn = computed(() => userState.address && userState.mnemonic.length === 24)

export {
    $userForm,
    userDialog,
    userRules,
    userForm,
    userSignedIn,
    userSignIn,
    userDialogToggle
}
