<template>
    <div id="app">
        <el-container>
            <el-header />
            <el-main>
                <slot />
            </el-main>
            <el-footer />
        </el-container>
    </div>
</template>

<script setup>
    import {
        ElHeader,
        ElMain,
        ElFooter,
        ElContainer
    } from 'element-plus'
</script>
