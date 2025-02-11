<template>
  <pre>
    {{ operation }}
  </pre>
</template>

<script setup lang="ts">
import type { Operation } from '../../../api/types/OpenAPISpecs'

const { operation } = defineProps<{
  operation: Operation
}>()

</script>

<style scoped>
</style>
