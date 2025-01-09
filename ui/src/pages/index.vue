<template>
  <top-bar v-if="$route.query['hide-toolbar'] !== 'false'"/>
  <h1>Hello world</h1>
  <v-alert
    v-if="!url.startsWith('http://') && !url.startsWith('https://')"
    type="warning"
    variant="outlined"
    :text="'URL must start with http:// or https://'"
  />
  <v-alert
    v-if="urlFetch.error.value"
    type="error"
    variant="outlined"
    :text="urlFetch.error.value"
  />
  <pre>{{ urlFetch.data.value }}</pre>
</template>

<script setup lang="ts">
const url = useStringSearchParam('url')
const urlFetch = useFetch(url, { notifError: false })

// TODO validate urlFetch.data.value
</script>

<style scoped>
</style>
