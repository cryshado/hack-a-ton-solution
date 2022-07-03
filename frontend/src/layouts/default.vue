<template>
    <div id="app">
        <el-container>
            <el-header>
                <el-row align="middle" justify="end">
                    <el-col
                        class="mt-4 mb-4"
                        :span="6"
                    >
                        <el-button
                            round
                            bg
                            :icon="lockIcon"
                            @click="userDialogToggle"
                        >
                            {{ userSignedIn ? 'Welcome mr. John' : 'Sign In' }}
                        </el-button>
                    </el-col>
                    
                </el-row>
            </el-header>
            <el-main class="app-centered">
                <slot />
            </el-main>
        </el-container>
    </div>
    <el-dialog
        v-model="userDialog"
        title="Sign In"
        :width="320"
    >
        <el-form
            label-position="top"
            ref="$userForm"
            :model="userForm"
            :rules="userRules"
        >
            <el-form-item
                label="Mnemonic"
                prop="mnemonic"
            >
                <el-input
                    v-model="userForm.mnemonic"
                    placeholder="first second third ... twenty-fourth"
                    autocomplete="off"
                    type="textarea"
                    resize="none"
                    :rows="6"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button
                    @click="userSignIn($userForm)"
                >
                    Sign In
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
    import { computed } from '#imports'

    import {
        ElHeader,
        ElMain,
        ElFooter,
        ElContainer,
        ElButton,
        ElRow,
        ElCol,
        ElDialog,
        ElForm,
        ElFormItem,
        ElInput
    } from 'element-plus'

    import {
        Lock,
        Unlock
    } from '@element-plus/icons-vue'

    import {
        $userForm,
        userDialog,
        userForm,
        userRules,
        userSignedIn,
        userSignIn,
        userDialogToggle
    } from '@/composables/signin'

    const lockIcon = computed(() => userSignedIn.value ? Lock : Unlock)
</script>

<style scoped>
    .app-centered {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>