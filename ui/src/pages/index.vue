<template>
  <top-bar v-if="$route.query['hide-toolbar'] !== 'false'" />
  <navigation-drawer />
  <v-container>
    <v-alert
      v-if="!validUrl"
      type="warning"
      variant="outlined"
      :text="'URL must start with http:// or https://'"
    />
    <v-alert
      v-if="urlFetch.error.value"
      type="error"
      title="Cannot retrieve data for this URL"
      variant="outlined"
      :text="urlFetch.error.value"
    />
    <home
      v-if="urlFetch.data.value && validUrl"
      :info="urlFetch.data.value.info"
      :external-docs="urlFetch.data.value.externalDocs"
      :servers="urlFetch.data.value.servers"
    />
  </v-container>
  <pre>{{ urlFetch.data.value }}</pre>
</template>

<script setup lang="ts">
import { OpenAPISpecs } from '#api/types'

const url = useStringSearchParam('url')
const validUrl = computed(() => url.value.startsWith('http://') || url.value.startsWith('https://'))
const urlFetch = useFetch<OpenAPISpecs>(url, { notifError: false })

// TODO validate urlFetch.data.value
</script>

<style scoped>
</style>
