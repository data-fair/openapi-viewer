<template>
  <top-bar v-if="$route.query['hide-toolbar'] !== 'false'" />
  <navigation-drawer
    :paths="derefDoc?.paths"
    :tags="derefDoc?.tags"
  />
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
      v-if="derefDoc && validUrl && $route.hash === ''"
      :info="derefDoc.info"
      :external-docs="derefDoc.externalDocs"
      :servers="derefDoc.servers"
      :schemas="derefDoc.components?.schemas"
    />
    <operation
      v-else-if="derefDoc && validUrl && operationData?.operation"
      :operation="operationData.operation"
      :path-item-parameters="operationData.pathItemParameters"
    />
    <v-alert
      v-else-if="derefDoc && validUrl && !operationData?.operation"
      type="warning"
      variant="outlined"
      text="The hash does not match any operationId or path in the OpenAPI specs"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { OpenAPISpecs, Operation } from '#api/types'
import type { Parameter } from '~/utils/transform'
import { dereference } from '@apidevtools/json-schema-ref-parser'
import { computedAsync } from '@vueuse/core'

const route = useRoute()
const url = useStringSearchParam('url')
const validUrl = computed(() => url.value.startsWith('http://') || url.value.startsWith('https://'))
const urlFetch = useFetch<OpenAPISpecs>(url, { notifError: false })

const evaluating = shallowRef(false)
const derefDoc = computedAsync(
  async () => {
    if (urlFetch.data.value) {
      try {
        return await dereference(urlFetch.data.value, { mutateInputSchema: false, circular: 'ignore' }) as OpenAPISpecs
      } catch (error) {
        console.error('Error during dereferencing:', error)
      }
    }
  },
  undefined,
  evaluating
)

const operationData = computed(() => {
  const hash = route.hash.replace('#', '')

  if (derefDoc.value?.paths) {
    for (const path in derefDoc.value.paths) { // For each route
      for (const method in derefDoc.value.paths[path]) { // For each method
        const operation = derefDoc.value.paths[path][method] as Operation
        // If the hash (the selected operation) matches an operationId or a path
        if (operation?.operationId === hash || `${path}|${method}` === hash) {
          const pathItemParameters = derefDoc.value.paths[path]?.parameters as Parameter[] || []
          return { operation, pathItemParameters }
        }
      }
    }
  }

  return null
})

watch(
  () => derefDoc.value,
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
