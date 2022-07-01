<template>
    <nuxt-page />
</template>

<script setup lang="ts">
    import { provide } from '#imports' 
    import { ID_INJECTION_KEY } from 'element-plus'

    provide(ID_INJECTION_KEY, {
        prefix: 100,
        current: 0
    })
</script>
