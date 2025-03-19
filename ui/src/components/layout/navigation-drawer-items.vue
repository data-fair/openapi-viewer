<template>
  <v-list-item
    v-for="item in formattedOperations[tag]"
    :key="item.path"
    :active="$route.query.operation === `${item.hash}`"
    :class="{
      'text-disabled font-italic': item.deprecated
    }"
    :title="item.summary"
    rounded
    @click="$router.push({ query: { ...$route.query, operation: item.hash} })"
  >
    <template #append>
      <v-chip
        density="compact"
        variant="text"
        size="small"
        :color="colorMethods[item.method]"
        :disabled="item.deprecated"
        :text="item.method.toUpperCase()"
      />
    </template>
    <v-tooltip
      activator="parent"
      close-delay="250"
      open-delay="500"
    >
      {{ item.path }}
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

</script>

<style scoped>
</style>
