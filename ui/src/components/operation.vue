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
      <v-tabs
        v-model="panelLeft"
      >
        <v-tab value="parameters">
          {{ t('parameters') }}
        </v-tab>
        <v-tab
          value="snippet"
        >
          Curl / Url
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="panelLeft">
        <v-tabs-window-item value="parameters">
          <v-form class="mr-2">
            <v-defaults-provider
              :defaults="{
                global: {
                  persistentPlaceholder: true,
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
        </v-tabs-window-item>

        <v-tabs-window-item value="snippet">
          <snippet
            :endpoint-query-values="endpointQueryValues"
            :server-url="serverUrl"
            :method="method"
            :path="path"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-col>

    <v-col cols="6">
      <operation-panel-right
        :operation="operation"
        :response-data="responseData"
        :loading="loading"
        @execute-request="executeRequest"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { GenericEndpointQuery, Operation } from '#api/types'
import type { Parameter } from '~/utils/transform'
import type { SchemaObject } from 'ajv'

import Vjsf from '@koumoul/vjsf'
import { marked } from 'marked'

const { operation, pathItemParameters, serverUrl, method, path } = defineProps<{
  operation: Operation
  pathItemParameters: Parameter[]
  serverUrl: string | null
  method: string
  path: string
}>()

const { t } = useI18n()

const panelLeft = ref<string>('parameters')
const schemaOrExamplesTab = ref<string>('schema')
const endpointQueryValues = ref<GenericEndpointQuery>({})
const endpointQuerySchema = ref<SchemaObject>(getVJSFSchema(operation, pathItemParameters))
const responseData = ref<Record<string, any> | null>(null)
const loading = ref(false)

const fullPath = ref<string>(getFullPath())

function getFullPath () {
  let fullPath = path
  if (endpointQueryValues.value.path) {
    for (const [key, value] of Object.entries(endpointQueryValues.value.path)) {
      fullPath = fullPath.replace(`{${key}}`, encodeURIComponent(value))
    }
  }
  return fullPath
}

watch(() => endpointQueryValues, () => {
  fullPath.value = getFullPath()
}, { deep: true })

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
      body = endpointQueryValues.value.body.value
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

  // operationPanelRightRef.value?.setActiveTab('serverResponse')
  loading.value = false
}

const vjsfOptions = {
  density: 'comfortable',
  initialValidation: 'always',
  lang: 'en',
  titleDepth: 4,
  updateOn: 'blur',
  useDefault: 'placeholder' as const,
  useDeprecated: true,
  useExample: 'help',
  useTitle: 'hint' as const,
  validateOn: 'blur',
  xI18n: true
}

if ($uiConfig.useSimpleDirectory) {
  const session = useSession()
  vjsfOptions.lang = session.state.lang
}

</script>

<i18n lang="yaml">
  en:
    deprecated: "Deprecated"
    externalDoc: "External documentation"
    examples: "Examples"
    parameters: "Parameters"
    schema: "Schema"
    tags: "Tags"
  fr:
    deprecated: "Déprécié"
    externalDoc: "Documentation externe"
    examples: "Exemples"
    parameters: "Paramètres"
    schema: "Schéma"
    tags: "Tags"
</i18n>

<style scoped>
</style>
