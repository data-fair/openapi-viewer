<template>
  <v-container>
    <h2 class="text-headline-large mb-4">
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
// same origin as this page, whatever the dev env's port
const base = window.location.origin + $sitePath
const links = [
  ['Default URL', base + '/openapi-viewer/'],
  ['Allowed url', base + '/openapi-viewer/?urlType=example&filename=fulltest.json'],
  ['With drawer to the right', base + '/openapi-viewer/?urlType=example&filename=fulltest.json&drawerLocation=right'],
  ['Example Data Fair', base + '/openapi-viewer/?urlType=example&filename=api-docs.json'],
  ['Example Data Fair YAML', base + '/openapi-viewer/?urlType=example&filename=api-docs.yaml'],
  ['Example recursive', base + '/openapi-viewer/?urlType=example&filename=recursive.yaml'],
  ['Example pet store', base + '/openapi-viewer/?urlType=petstore']
]
</script>

<style>
</style>
