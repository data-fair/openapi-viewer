<template>
  <v-app-bar
    title="OpenAPI 3 Viewer"
    :elevation="2"
  >
    <v-text-field
      v-model="search"
      density="compact"
      hide-details="auto"
      label="OpenAPI JSON Location"
      variant="solo-filled"
      clearable
      :prepend-inner-icon="mdiCodeJson"
    />
    <v-spacer />
    <v-select
      v-model="selectedExample"
      class="mr-4"
      density="compact"
      hide-details="auto"
      item-value="file"
      label="Examples"
      max-width="200"
      variant="solo-filled"
      clearable
      :items="examples"
    />
  </v-app-bar>
</template>

<script setup lang="ts">
import examples from '~/assets/examples.json'

const search = useStringSearchParam('url')
const selectedExample = ref<string | null>(null)

watch(selectedExample, (newValue) => {
  if (newValue) {
    search.value = `${window.location.origin}${window.location.pathname}examples/${newValue}`
  }
})

</script>

<style scoped>
</style>
