<template>
  <v-list-item
    v-for="item in formattedOperations[tag]"
    :key="item.path"
    :active="$route.query.operation === `${item.hash}`"
    rounded
    @click="$router.push({ query: { ...$route.query, operation: item.hash} })"
  >
    <template #title>
      <span
        :class="{
          'text-disabled': item.deprecated,
          'font-italic': item.deprecated
        }"
        class="ml-2"
      >
        {{ item.path }}
      </span>
    </template>
    <template #append>
      <v-chip
        density="compact"
        variant="text"
        :color="colorMethods[item.method]"
        :disabled="item.deprecated"
        :text="item.method.toUpperCase()"
      />
    </template>
    <v-tooltip
      v-if="item.summary"
      activator="parent"
      close-delay="250"
      open-delay="500"
    >
      {{ item.path }}<br>
      {{ item.summary }}
    </v-tooltip>
  </v-list-item>
</template>

<script setup lang="ts">

const { formattedOperations, tag } = defineProps<{
  formattedOperations: Record<string, {
    path: string,
    method: string,
    summary: string,
    hash: string,
    deprecated?: boolean
  }[]>
  tag: string
}>()

const colorMethods: Record<string, string> = {
  delete: 'error',
  get: '#61affe',
  patch: '#50e3c2',
  post: 'success',
  put: '#fca130',
  options: '#0d5aa7',
  head: '#9012fe',
  trace: 'default'
}

</script>

<style scoped>
</style>
