<template>
  <!-- Title / Deprecated? of the operation -->
  <h1>
    {{ operation.summary }}
    <v-chip
      v-if="operation.deprecated"
      density="compact"
      color="warning"
      :prepend-icon="mdiAlertCircle"
      :text="t('deprecated')"
    />
  </h1>

  <div
    v-if="operation.description"
    v-safe-html="marked(operation.description)"
  />

  <!-- External documentation -->
  <div
    v-if="operation.externalDocs"
    class="text-h6"
  >
    {{ t('externalDoc') }} :
    <v-chip
      color="primary"
      density="compact"
      rel="noopener noreferrer"
      target="_blank"
      :href="operation.externalDocs.url"
      :prepend-icon="mdiBookOpenVariant"
      :text="operation.externalDocs.description"
    />
  </div>

  <!-- List of tags -->
  <div
    v-if="operation.tags && operation.tags.length > 1"
    class="text-h6"
  >
    {{ t('tags') }} :
    <v-chip
      v-for="tag in operation.tags"
      :key="tag"
      density="compact"
      class="mr-2"
      :text="tag"
    />
  </div>

  <v-row>
    <v-col cols="6">
      <v-form>
        <v-defaults-provider
          :defaults="{
            global: {
              hideDetails: 'auto',
            },
            VCheckbox: {
              density: 'compact'
            },
          }"
        >
          <vjsf
            v-model="endpointQueryValues"
            :schema="endpointQuerySchema"
            :options="vjsfOptions"
          >
            <template #schema-and-examples="{ schema, examples}">
              <!-- Show tabs selector only if there are examples, else just show the schema window -->
              <v-tabs
                v-if="(examples && Object.keys(examples).length > 0) || (Array.isArray(examples) && examples.length > 0)"
                v-model="schemaOrExamplesTab"
              >
                <v-tab value="schema">
                  {{ t('schema') }}
                </v-tab>
                <v-tab value="examples">
                  {{ t('examples') }}
                </v-tab>
              </v-tabs>
              <v-tabs-window v-model="schemaOrExamplesTab">
                <v-tabs-window-item value="schema">
                  <schema-viewer
                    :key="schema"
                    :json-schema="schema"
                  />
                </v-tabs-window-item>
                <v-tabs-window-item value="examples">
                  <prism
                    :key="examples"
                    language="json"
                    max-height="400px"
                    copy
                  >
                    {{ JSON.stringify(examples, null, 2) }}
                  </prism>
                </v-tabs-window-item>
              </v-tabs-window>
            </template>
          </vjsf>
        </v-defaults-provider>
      </v-form>

      <v-row justify="center">
        <v-btn
          class="my-4"
          color="primary"
          :prepend-icon="mdiPlay"
          :loading="loading"
          :disabled="loading"
          @click="executeRequest"
        >
          {{ t('execute') }}
        </v-btn>
      </v-row>
    </v-col>

    <v-col cols="6">
      <operation-pannel-right
        ref="operationPannelRightRef"
        :operation="operation"
        :endpoint-query-values="endpointQueryValues"
        :response-data="responseData"
        :server-url="serverUrl"
        :method="method"
        :path="path"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { GenericEndpointQuery, Operation } from '#api/types'
import type { Parameter } from '~/utils/transform'
import type { SchemaObject } from 'ajv'
import { marked } from 'marked'
import Vjsf from '@koumoul/vjsf'

const { operation, pathItemParameters, serverUrl, method, path } = defineProps<{
  operation: Operation
  pathItemParameters: Parameter[]
  serverUrl: string | null
  method: string
  path: string
}>()

const { t } = useI18n()

const schemaOrExamplesTab = ref<string>('schema')
const endpointQueryValues = ref<GenericEndpointQuery>({})
const endpointQuerySchema = ref<SchemaObject>({})
const responseData = ref<Record<string, any> | null>(null)
const operationPannelRightRef = ref<null | { setActiveTab: (tab: string) => void }>(null)
const loading = ref(false)

const executeRequest = async () => {
  loading.value = true
  responseData.value = null

  // Replace path parameters
  let processedPath = path
  if (endpointQueryValues.value.path) {
    for (const [key, value] of Object.entries(endpointQueryValues.value.path)) {
      processedPath = processedPath.replace(`{${key}}`, encodeURIComponent(value))
    }
  }

  // Build URL with query parameters
  let url = `${serverUrl || ''}${processedPath}`
  if (endpointQueryValues.value.query && Object.keys(endpointQueryValues.value.query).length > 0) {
    const queryParams = new URLSearchParams(endpointQueryValues.value.query).toString()
    url += `?${queryParams}`
  }

  // Prepare headers
  const headers: Record<string, string> = {}
  if (endpointQueryValues.value.header) {
    for (const [key, value] of Object.entries(endpointQueryValues.value.header)) {
      headers[key] = value
    }
  }

  // Prepare body
  let body: BodyInit | null = null
  if (endpointQueryValues.value.body && Object.keys(endpointQueryValues.value.body).length > 0) {
    const contentType = endpointQueryValues.value.body?.contentType || 'application/json'

    if (contentType === 'multipart/form-data') {
      const formData = new FormData()
      for (const [key, value] of Object.entries(endpointQueryValues.value.body)) {
        if (key !== 'contentType') {
          if (value instanceof File) {
            formData.append(key, value, value.name)
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value as string | Blob)
          }
        }
      }
      body = formData
    } else {
      headers['Content-Type'] = contentType
      body = JSON.stringify(endpointQueryValues.value.body)
    }
  }

  const response = await fetch(url, {
    method: method.toUpperCase(),
    headers,
    body
  })

  const contentType = response.headers.get('content-type')
  let responseType
  let responseBody: any
  if (!contentType) {
    responseBody = null
  } else if (contentType.includes('json')) {
    responseBody = await response.json().catch(() => {
      responseBody = 'Invalid JSON'
    })
    responseType = 'json'
  } else if (contentType.startsWith('image/')) {
    responseBody = URL.createObjectURL(await response.blob())
    responseType = 'image'
  } else {
    try {
      responseBody = await response.text()
      responseType = contentType
    } catch (e) {
      responseBody = undefined
      responseType = undefined
    }
  }

  responseData.value = {
    status: response.status.toString(),
    statusText: response.statusText,
    body: responseBody,
    type: responseType,
    headers: Object.fromEntries(response.headers.entries())
  }

  operationPannelRightRef.value?.setActiveTab('serverResponse')
  loading.value = false
}

onMounted(() => {
  endpointQuerySchema.value = getVJSFSchema(operation, pathItemParameters)
  endpointQueryValues.value = {}
  responseData.value = null
})

const vjsfOptions = {
  density: 'comfortable',
  initialValidation: 'always',
  updateOn: 'blur',
  validateOn: 'blur',
  titleDepth: 3
}

</script>

<i18n lang="yaml">
  en:
    deprecated: "Deprecated"
    execute: "Execute"
    externalDoc: "External documentation"
    examples: "Examples"
    schema: "Schema"
    tags: "Tags"
  fr:
    deprecated: "Déprécié"
    execute: "Exécuter"
    externalDoc: "Documentation externe"
    examples: "Exemples"
    schema: "Schéma"
    tags: "Tags"
</i18n>

<style scoped>
</style>
