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
      v-else-if="urlFetch.data.value && validUrl && operationData?.operation"
      :operation="operationData.operation"
    />
    <v-alert
      v-else-if="urlFetch.data.value && validUrl && !operationData?.operation"
      type="warning"
      variant="outlined"
      text="The hash does not match any operationId or path in the OpenAPI specs"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { OpenAPISpecs, Operation } from '#api/types'

const route = useRoute()
const url = useStringSearchParam('url')
const validUrl = computed(() => url.value.startsWith('http://') || url.value.startsWith('https://'))
const urlFetch = useFetch<OpenAPISpecs>(url, { notifError: false })

const operationData = computed(() => {
  const hash = route.hash.replace('#', '')

  if (urlFetch.data.value?.paths) {
    for (const path in urlFetch.data.value.paths) { // For each route
      for (const method in urlFetch.data.value.paths[path]) { // For each method
        const operation = urlFetch.data.value.paths[path][method] as Operation
        // If the hash (the selected operation) matches an operationId or a path
        if (operation?.operationId === hash || `${path}|${method}` === hash) {
          const pathItemParameters = urlFetch.data.value.paths[path]?.parameters || []
          return { operation, pathItemParameters }
        }
      }
    }
  }

  return null
})

watch(
  () => urlFetch.data.value,
  (newValue) => {
    if (newValue) {
      initTransformer(newValue)
    }
  }
)

// TODO validate urlFetch.data.value
</script>

<style scoped>
</style>
