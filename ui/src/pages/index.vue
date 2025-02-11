<template>
  <top-bar v-if="$route.query['hide-toolbar'] !== 'false'" />
  <navigation-drawer :paths="urlFetch.data.value?.paths" />
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
      v-if="urlFetch.data.value && validUrl && $route.hash === ''"
      :info="urlFetch.data.value.info"
      :external-docs="urlFetch.data.value.externalDocs"
      :servers="urlFetch.data.value.servers"
      :schemas="urlFetch.data.value.components?.schemas"
    />
    <operation
      v-else-if="urlFetch.data.value && validUrl && selectedOperation"
      :operation="selectedOperation"
      :servers="urlFetch.data.value.servers"
      :security="urlFetch.data.value.security"
      :security-schemes="urlFetch.data.value.components?.securitySchemes"
    />
    <v-alert
      v-else-if="urlFetch.data.value && validUrl && !selectedOperation"
      type="warning"
      variant="outlined"
      text="The hash does not match any operationId or path in the OpenAPI specs"
    />
  </v-container>
  <pre>{{ urlFetch.data.value }}</pre>
</template>

<script setup lang="ts">
import type { OpenAPISpecs } from '#api/types'

const route = useRoute()
const url = useStringSearchParam('url')
const validUrl = computed(() => url.value.startsWith('http://') || url.value.startsWith('https://'))
const urlFetch = useFetch<OpenAPISpecs>(url, { notifError: false })

const selectedOperation = computed(() => {
  const hash = route.hash.replace('#', '')
  if (hash.includes('|')) {
    const [firstPart, secondPart] = hash.split('|')
    return urlFetch.data.value?.paths?.[firstPart]?.[secondPart]
  } else {
    for (const path in urlFetch.data.value?.paths) {
      for (const method in urlFetch.data.value.paths[path]) {
        const operation = urlFetch.data.value.paths[path][method]
        if (operation?.operationId === hash) {
          return operation
        }
      }
    }
    return null
  }
})

// TODO validate urlFetch.data.value
</script>

<style scoped>
</style>
