<template>
  <v-container>
    <h2 class="text-h4 mb-4">
      Exemples
    </h2>
    <v-list>
      <v-list-item
        v-for="link in links"
        :key="link[1]"
      >
        <v-list-item-title>{{ link[0] }}</v-list-item-title>
        <v-list-item-subtitle><a :href="link[1]">{{ link[1] }}</a></v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
const links = [
  ['Default URL', 'http://localhost:5600/openapi-viewer/'],
  ['Allowed url', 'http://localhost:5600/openapi-viewer/?urlType=example&filename=fulltest.json'],
  ['With drawer to the right', 'http://localhost:5600/openapi-viewer/?urlType=example&filename=fulltest.json&drawerLocation=right'],
  ['Example Data Fair', 'http://localhost:5600/openapi-viewer/?urlType=example&filename=api-docs.json'],
  ['Example Data Fair YAML', 'http://localhost:5600/openapi-viewer/?urlType=example&filename=api-docs.yaml'],
  ['Example recursive', 'http://localhost:5600/openapi-viewer/?urlType=example&filename=recusive.yaml'],
  ['Example pet store', 'http://localhost:5600/openapi-viewer/?urlType=petstore']
]
</script>

<style>
</style>
