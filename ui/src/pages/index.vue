<template>
  <top-bar v-if="$route.query['hide-toolbar'] === undefined || !$route.query['hide-toolbar']" />
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
    <v-alert
      v-if="errorMessage"
      type="error"
      title="Error"
      variant="outlined"
      :text="errorMessage"
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
      :server-url="operationData.serverUrl"
      :method="operationData.method"
      :path="operationData.path"
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
import yaml from 'js-yaml'
// import { validate } from '../../../api/types/OpenAPISpecs'

const route = useRoute()
const url = useStringSearchParam('url')
const validUrl = computed(() => url.value && /^https?:\/\//.test(url.value))
const urlFetch = useFetch<OpenAPISpecs>(url, { notifError: false })
const errorMessage = ref<string | null>(null)

const evaluating = shallowRef(false)
const derefDoc = computedAsync(
  async () => {
    if (urlFetch.data.value) {
      // try {
      //   assertValid(urlFetch.data.value)
      // } catch (error) {
      //   console.error('Error during validation:', error)
      //   errorMessage.value = 'The OpenAPI specs are not valid'
      // }
      try {
        const deref = await dereference(
          typeof urlFetch.data.value === 'string'
            ? yaml.load(urlFetch.data.value)
            : urlFetch.data.value,
          {
            mutateInputSchema: false,
            circular: 'ignore'
          }) as OpenAPISpecs

        errorMessage.value = null
        return deref
      } catch (error) {
        errorMessage.value = 'The OpenAPI specs are not valid'
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
          const serverUrl = derefDoc.value.servers?.[0]?.url || null
          return { operation, pathItemParameters, path, method, serverUrl }
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

</script>

<style scoped>
</style>
