<template>
  <v-list-item
    v-for="item in formattedOperations[tag]"
    :key="item.path"
    :active="$route.hash === `#${item.hash}`"
    @click="$router.push({ hash: `#${item.hash}`, query: $route.query})"
  >
    <template #title>
      <span
        :class="{
          'text-disabled': item.deprecated,
          'font-italic': item.deprecated
        }"
      >
        {{ item.path }}
      </span>
    </template>
    <template #append>
      <v-chip
        density="compact"
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
      :text="item.summary"
    />
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
  get: 'primary',
  patch: 'secondary',
  post: 'success',
  put: 'info',
  options: 'default',
  head: 'default',
  trace: 'default'
}

</script>

<style scoped>
</style>
