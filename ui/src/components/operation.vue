<template>
  <h1>
    {{ operation.summary }}
    <v-chip
      v-if="operation.deprecated"
      density="compact"
      color="warning"
      text="Deprecated"
      :prepend-icon="mdiAlertCircle"
    />
  </h1>

  <div
    v-if="operation.description"
    v-html="marked(operation.description)"
  />

  <div
    v-if="operation.externalDocs"
    class="text-h6"
  >
    Documentation :
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

  <div
    v-if="operation.tags && operation.tags.length > 1"
    class="text-h6"
  >
    Tags :
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
              <v-tabs v-model="schemaExamplesTab">
                <v-tab value="schema">
                  Schema
                </v-tab>
                <v-tab value="examples">
                  Examples
                </v-tab>
              </v-tabs>
              <v-tabs-window v-model="schemaExamplesTab">
                <v-tabs-window-item value="schema">
                  <prism
                    :key="schema"
                    language="json"
                    max-height="400px"
                  >
                    {{ JSON.stringify(schema, null, 2) }}
                  </prism>
                </v-tabs-window-item>
                <v-tabs-window-item value="examples">
                  <prism
                    :key="examples"
                    language="json"
                    max-height="400px"
                  >
                    {{ JSON.stringify(examples, null, 2) }}
                  </prism>
                </v-tabs-window-item>
              </v-tabs-window>
            </template>
          </vjsf>
        </v-defaults-provider>
      </v-form>

      <!-- <v-fab
        text="Execute"
        color="primary"
        location="bottom center"
        size="large"
        :prepend-icon="mdiPlay"
        :app="true"
        extended
      /> -->

      <v-row justify="center">
        <v-btn
          class="my-4"
          color="primary"
          :prepend-icon="mdiPlay"
          @click="executeRequest"
        >
          Execute
        </v-btn>
      </v-row>
    </v-col>

    <v-col cols="6">
      <operation-pannel-right
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

const schemaExamplesTab = ref<string>('schema')
const endpointQueryValues = ref<GenericEndpointQuery>({
  header: {},
  path: {},
  query: {},
  body: {}
})
const endpointQuerySchema = ref<SchemaObject>({})
const responseData = ref<Record<string, any> | null>(null)

const executeRequest = async () => {
  responseData.value = null

  let processedPath = path
  if (endpointQueryValues.value.path) {
    for (const [key, value] of Object.entries(endpointQueryValues.value.path)) {
      processedPath = processedPath.replace(`{${key}}`, encodeURIComponent(value))
    }
  }

  let url = `${serverUrl || ''}${processedPath}`
  if (endpointQueryValues.value.query && Object.keys(endpointQueryValues.value.query).length > 0) {
    const queryParams = new URLSearchParams(endpointQueryValues.value.query).toString()
    url += `?${queryParams}`
  }

  const headers: Record<string, string> = {}
  if (endpointQueryValues.value.header) {
    for (const [key, value] of Object.entries(endpointQueryValues.value.header)) {
      headers[key] = value
    }
  }

  let body: BodyInit | null = null
  if (endpointQueryValues.value.body && Object.keys(endpointQueryValues.value.body).length > 0) {
    const contentType = endpointQueryValues.value.body?.contentType || 'application/json'
    headers['Content-Type'] = contentType

    if (contentType === 'multipart/form-data') {
      const formData = new FormData()
      for (const [key, value] of Object.entries(endpointQueryValues.value.body)) {
        if (key !== 'contentType') {
          if (value instanceof File) {
            formData.append(key, value, value.name)
          } else {
            formData.append(key, value as string | Blob)
          }
        }
      }
      body = formData
    } else {
      body = JSON.stringify(endpointQueryValues.value.body)
    }
  }

  const response = await fetch(url, {
    method: method.toUpperCase(),
    headers,
    body
  })

  const contentType = response.headers.get('content-type')
  let responseBody: any
  if (!contentType) {
    responseBody = null
  } else if (contentType.includes('application/json')) {
    responseBody = await response.json().catch(() => ({ error: 'Invalid JSON' }))
  } else if (contentType.includes('text')) {
    responseBody = await response.text().catch(() => 'Error parsing text')
  } else {
    responseBody = 'The content type is not supported yet'
  }

  responseData.value = {
    status: response.status.toString(),
    statusText: response.statusText,
    body: responseBody,
    headers: Object.fromEntries(response.headers.entries())
  }
}

onMounted(() => {
  endpointQuerySchema.value = getVJSFSchema(operation, pathItemParameters)
})

watch(() => operation, () => {
  endpointQuerySchema.value = getVJSFSchema(operation, pathItemParameters)
  endpointQueryValues.value = {}
  responseData.value = null
})

const vjsfOptions = {
  density: 'comfortable',
  initialValidation: 'always',
  updateOn: 'blur',
  validateOn: 'blur',
  locale: 'fr',
  titleDepth: 3
}

</script>

<style scoped>
</style>
