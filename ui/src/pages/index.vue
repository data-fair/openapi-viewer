<template>
  <top-bar
    v-if="$route.query['hide-toolbar'] === undefined
      || !$route.query['hide-toolbar']"
  />
  <navigation-drawer
    :paths="derefDoc?.paths"
    :tags="derefDoc?.tags"
  />
  <v-container data-iframe-height>
    <v-alert
      v-if="!validUrl"
      type="warning"
      title="No url provided or the url is not valid"
      variant="outlined"
    />
    <v-alert
      v-if="urlFetch.error.value"
      type="error"
      title="Cannot retrieve data for this URL"
      variant="outlined"
      :text="urlFetch.error.value"
    />
    <v-alert
      v-if="derefError"
      type="error"
      title="Error"
      variant="outlined"
      :text="derefError"
    />
    <template v-if="derefDoc && validUrl">
      <home
        v-if="$route.hash === ''"
        :info="derefDoc.info"
        :external-docs="derefDoc.externalDocs"
        :schemas="derefDoc.components?.schemas"
        :servers="derefDoc.servers"
      />
      <operation
        v-else-if="fullOperation?.operation"
        :operation="fullOperation.operation"
        :path-item-parameters="fullOperation.pathItemParameters"
        :path="fullOperation.path"
        :method="fullOperation.method"
        :server-url="fullOperation.serverUrl"
      />
      <v-alert
        v-else
        type="warning"
        text="The hash does not match any operationId or path in the OpenAPI specs"
        variant="outlined"
      />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import type { OpenAPISpecs, Operation } from '#api/types'
import type { Parameter } from '~/utils/transform'
import { dereference } from '@apidevtools/json-schema-ref-parser'
import { computedAsync } from '@vueuse/core'
import yaml from 'js-yaml'

const route = useRoute()
const url = useStringSearchParam('url')
const urlFetch = useFetch<OpenAPISpecs>(url, { notifError: false })

const derefError = ref<string | null>(null)
const dereferencing = shallowRef(false) // True if the dereferencing is in progress
const validUrl = computed(() => url.value && /^https?:\/\//.test(url.value))

/*
 * Dereference the OpenAPI specs
 */
const derefDoc = computedAsync(
  async () => {
    if (!urlFetch.data.value || !validUrl.value) return undefined
    try {
      const deref = await dereference(
        typeof urlFetch.data.value === 'string'
          ? yaml.load(urlFetch.data.value) // If the OpenAPI specs are in YAML
          : urlFetch.data.value,
        {
          mutateInputSchema: false,
          dereference: {
            circular: false, // Throw an error if circular references are found
          }
        }) as OpenAPISpecs

      derefError.value = null
      return deref
    } catch (error) {
      derefError.value = 'The OpenAPI specs are not valid, there may be a circular reference'
    }
  },
  undefined,
  dereferencing
)

/*
 *  Find the operation selected (with the hash)
 */
const fullOperation = computed<{
  operation: Operation,
  pathItemParameters: Parameter[],
  path: string,
  method: string,
  serverUrl: string
} | null>(() => {
  const hash = route.hash.replace('#', '')

  for (const path in derefDoc.value?.paths) { // For each route
    for (const method in derefDoc.value.paths[path]) { // For each method
      const operation = derefDoc.value.paths[path][method] as Operation

      // If the hash (the selected operation) matches an operationId or a path
      if (operation?.operationId === hash || `${path}|${method}` === hash) {
        const pathItemParameters = derefDoc.value.paths[path]?.parameters as Parameter[] || []
        const serverUrl = derefDoc.value.servers?.[0]?.url || ''
        return { operation, pathItemParameters, path, method, serverUrl }
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
