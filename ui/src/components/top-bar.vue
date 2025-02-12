<template>
  <v-app-bar
    title="OpenAPI 3 Viewer"
    :elevation="2"
  >
    <v-text-field
      v-model="search"
      density="compact"
      label="OpenAPI JSON Location"
      variant="solo-filled"
      clearable
      hide-details
      :prepend-inner-icon="mdiCodeJson"
    />
    <v-spacer />
    <!-- <v-select
      v-model="selectedExample"
      class="mr-4"
      density="compact"
      label="Examples"
      max-width="200"
      variant="solo-filled"
      clearable
      hide-details
      :items="exampleFiles"
    /> -->
  </v-app-bar>
</template>

<script setup lang="ts">
const search = useStringSearchParam('url')

</script>

<style scoped>
</style>
