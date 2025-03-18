<template>
  <navigation-drawer
    :paths="derefDoc?.paths"
    :tags="derefDoc?.tags"
  />
  <v-container
    data-iframe-height
    fluid
  >
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="outlined"
      :text="errorMessage"
      :title="t('error')"
    />
    <v-alert
      v-else-if="urlFetch.error.value"
      type="error"
      variant="outlined"
      :text="urlFetch.error.value.message"
      :title="t('errorCannotRetrieveData')"
    />
    <template v-if="derefDoc && url.length > 0">
      <home
        v-if="!$route.query.operation"
        :info="derefDoc.info"
        :external-docs="derefDoc.externalDocs"
        :schemas="derefDoc.components?.schemas"
        :servers="derefDoc.servers"
      />
      <operation
        v-else-if="fullOperation?.operation"
        :key="fullOperation.hash"
        :operation="fullOperation.operation"
        :path-item-parameters="fullOperation.pathItemParameters"
        :path="fullOperation.path"
        :method="fullOperation.method"
        :server-url="fullOperation.serverUrl"
      />
      <v-alert
        v-else
        type="warning"
        :text="t('errorHashNotMatch')"
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
import * as urlTemplate from 'url-template'
import YAML from 'js-yaml'

const { t } = useI18n()
const route = useRoute()
const url = ref<string>('')
const errorMessage = ref<string | null>(null)
const dereferencing = shallowRef(false) // True if the dereferencing is in progress

const urlFetch = useFetch<OpenAPISpecs>(url, { watch: false, notifError: false })

/*
 * Dereference the OpenAPI specs
 * -> Convert yaml to json if needed
 * -> Throw an error for circular references
 */
const derefDoc = computedAsync(
  async (onCancel) => {
    if (!urlFetch.data.value) return undefined

    // Abort the dereferencing if the URL changes
    const controller = new AbortController()
    onCancel(() => controller.abort())

    try {
      const deref = await dereference(
        typeof urlFetch.data.value === 'string'
          ? YAML.load(urlFetch.data.value) // If the OpenAPI specs are in YAML
          : urlFetch.data.value,
        {
          mutateInputSchema: false,
          dereference: {
            circular: false, // Throw an error if circular references are found
          }
        }
      ) as OpenAPISpecs

      errorMessage.value = null
      initTransformer(deref)
      return deref
    } catch (error) {
      if (controller.signal.aborted) return undefined
      else errorMessage.value = t('errorOpenAPISpecsNotValid')
    }
  },
  undefined,
  dereferencing
)

/*
 *  Find the operation selected with the hash (query parameter 'operation')
 */
const fullOperation = computed<{
  operation: Operation,
  pathItemParameters: Parameter[],
  path: string,
  method: string,
  serverUrl: string,
  hash: string
} | null>(() => {
  const hash = route.query.operation

  for (const path in derefDoc.value?.paths) { // For each route
    for (const method in derefDoc.value.paths[path]) { // For each method
      const operation = derefDoc.value.paths[path][method] as Operation

      // If the hash (the selected operation) matches the operationId or the path
      if (operation?.operationId === hash || `${path}|${method}` === hash) {
        const pathItemParameters = derefDoc.value.paths[path]?.parameters as Parameter[] || []
        const serverUrl = derefDoc.value.servers?.[0]?.url || ''
        return { operation, pathItemParameters, path, method, serverUrl, hash }
      }
    }
  }

  return null
})

watch(route.query, () => {
  derefDoc.value = undefined
  errorMessage.value = null

  if (route.query.urlType) {
    // Check url type
    if (!Object.keys($uiConfig.allowedUrls).includes(route.query.urlType as string)) {
      errorMessage.value = t('invalidUrlType')
      return
    }

    const template = $uiConfig.allowedUrls[route.query.urlType as string]

    // Check if all params are present
    const queryParams = route.query
    const requiredParams = (template.match(/{[^}]+}/g) || []).map((param) => param.slice(1, -1))
    const missingParams = requiredParams.filter((param) => !queryParams[param])
    if (missingParams.length > 0) {
      errorMessage.value = t('missingParams', { params: missingParams.join(', ') })
      return
    }

    // Replace the template params with the query params
    url.value = urlTemplate.parseTemplate(template).expand(queryParams)
  } else if ($uiConfig.defaultUrl) {
    url.value = $uiConfig.defaultUrl
  } else {
    errorMessage.value = t('missingUrl')
  }

  urlFetch.refresh()
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    error: "Error"
    missingUrl: "Missing URL parameter."
    errorCannotRetrieveData: "Cannot retrieve data for this URL."
    errorHashNotMatch: "The selected operation does not match any operationId or path in the OpenAPI specs."
    errorOpenAPISpecsNotValid: "The provided OpenAPI documentation is not valid, there may be a circular reference."
    invalidUrlType: "Invalid URL type."
    missingParams: "Missing parameters: {params}"
  fr:
    error: "Erreur"
    missingUrl: "Paramètre URL manquant."
    errorCannotRetrieveData: "Impossible de récupérer les données pour cette URL."
    errorHashNotMatch: "L'opération sélectionnée ne correspond à aucun operationId ou path dans les spécifications OpenAPI."
    errorOpenAPISpecsNotValid: "La documentation OpenAPI fournie n'est pas valide, il y a peut-être une référence circulaire."
    invalidUrlType: "Type d'URL invalide."
    missingParams: "Paramètres manquants : {params}"
</i18n>

<style scoped>
</style>
