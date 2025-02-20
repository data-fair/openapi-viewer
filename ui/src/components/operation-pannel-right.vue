<template>
  <v-expansion-panels
    v-model="panelRight"
    multiple
  >
    <v-expansion-panel
      value="snippet"
      static
    >
      <template #title>
        <h3>Curl / Url</h3>
      </template>
      <template #text>
        <h4>Curl command</h4>
        <snippet
          :endpoint-query-values="endpointQueryValues"
          :server-url="serverUrl"
          :method="method"
          :path="fullPath"
        />
        <h4>Request URL</h4>
        <prism
          :key="fullPath"
          language="bash"
          max-height="400px"
        >
          {{ (serverUrl || '') + fullPath }}
        </prism>
      </template>
    </v-expansion-panel>

    <v-expansion-panel
      value="serverResponse"
      static
    >
      <template #title>
        <h3>Server Response</h3>
      </template>
      <template #text>
        <template v-if="responseData">
          <h4>
            <v-chip
              :color="getCodeColors(responseData.status)"
              :text="responseData.status"
              density="compact"
              label
            />
            {{ responseData.statusText }}
          </h4>

          <template v-if="responseData.body">
            <h4>Response Body</h4>
            <prism
              language="json"
              max-height="400px"
            >
              {{ JSON.stringify(responseData.body, null, 2) }}
            </prism>
          </template>

          <template v-if="responseData.headers">
            <h4>Response Headers</h4>
            <prism
              language="json"
              max-height="400px"
            >
              {{ JSON.stringify(responseData.headers, null, 2) }}
            </prism>
          </template>
        </template>

        <template v-else>
          <p class="text-muted">
            Aucune réponse reçue pour le moment.
          </p>
        </template>
      </template>
    </v-expansion-panel>

    <v-expansion-panel
      v-if="operation.responses"
      value="responses"
      static
    >
      <template #title>
        <h3>Responses</h3>
      </template>
      <template #text>
        <v-tabs
          :key="Object.keys(operation.responses).join('-')"
          v-model="responsesCodeTab"
        >
          <v-tab
            v-for="status in Object.keys(operation.responses)"
            :key="status"
            :base-color="getCodeColors(status)"
            :value="status"
          >
            <v-chip
              :color="getCodeColors(status)"
              :text="status"
              density="compact"
              label
            />
          </v-tab>
        </v-tabs>

        <v-tabs-window
          v-model="responsesCodeTab"
        >
          <v-tabs-window-item
            v-for="(response, status) in operation.responses as unknown as Record<string, Response>"
            :key="status"
            :value="status"
          >
            <div
              v-if="response.description"
              class="mb-4 mt-2"
              v-html="marked(response.description)"
            />

            <!-- Content -->
            <template v-if="response.content">
              <v-row>
                <v-col cols="6">
                  <v-tabs
                    v-model="responsesExamplesSchemaTab[status]"
                  >
                    <v-tab
                      value="schema"
                      :disabled="!response.content[responsesContentType[status]]?.schema"
                    >
                      Schema
                    </v-tab>
                    <v-tab
                      value="examples"
                    >
                      Examples
                    </v-tab>
                  </v-tabs>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="responsesContentType[status]"
                    density="compact"
                    hide-details="auto"
                    label="Content-Type"
                    :items="Object.keys(response.content)"
                    @click.stop
                  />
                </v-col>
              </v-row>
              <v-tabs-window
                v-model="responsesExamplesSchemaTab[status]"
              >
                <v-tabs-window-item value="schema">
                  <prism
                    :key="status + '-content'"
                    language="json"
                    max-height="400px"
                  >
                    {{ JSON.stringify(response.content[responsesContentType[status]]?.schema, null, 2) }}
                  </prism>
                </v-tabs-window-item>

                <v-tabs-window-item value="examples">
                  <prism
                    language="json"
                    max-height="400px"
                  >
                    Functionality not supported yet
                  </prism>
                </v-tabs-window-item>
              </v-tabs-window>
            </template>

            <!-- Header -->
            <template v-if="response.headers">
              <h4>
                Response Headers
              </h4>
              <span class="font-italic">Functionality not supported yet</span><!-- TODO -->
            </template>
            <!-- Links -->
            <template v-if="response.links">
              <h4>
                Links
              </h4>
              <span class="font-italic">Functionality not supported yet</span><!-- TODO -->
            </template>
          </v-tabs-window-item>
        </v-tabs-window>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import type { GenericEndpointQuery, Operation } from '#api/types'
import type { SchemaObject } from 'ajv'
import { marked } from 'marked'

type Response = {
  description?: string
  content?: Record<string, { schema?: SchemaObject }>
  headers?: Record<string, any>
  links?: Record<string, any>
}

const { operation, endpointQueryValues, serverUrl, method, path } = defineProps<{
  operation: Operation
  endpointQueryValues: GenericEndpointQuery
  responseData: Record<string, any> | null
  serverUrl: string | null
  method: string
  path: string
}>()

const panelRight = ref<string[]>(['snippet', 'serverResponse', 'responses'])
const responsesCodeTab = ref<string>('default')
const responsesContentType = ref<Record<string, string>>({})
const responsesExamplesSchemaTab = ref<Record<string, string>>({})
const fullPath = ref<string>(path)

const getFullPath = () => {
  let fullPath = path
  if (endpointQueryValues.path) {
    for (const [key, value] of Object.entries(endpointQueryValues.path)) {
      fullPath = fullPath.replace(`{${key}}`, encodeURIComponent(value))
    }
  }
  return fullPath
}

watch(() => operation, () => {
  if (operation.responses && Object.keys(operation.responses).length) {
    Object.keys(operation.responses).forEach(status => {
      if (operation.responses![status].content) {
        responsesContentType.value[status] = Object.keys(operation.responses![status].content)[0]
      }
    })
    responsesCodeTab.value = Object.keys(operation.responses)[0]
  }
}, { immediate: true })

watch(() => endpointQueryValues, () => {
  fullPath.value = getFullPath()
}, { immediate: true, deep: true })

/*
 * Match the status code with a color
 * Ex: 200 => success
 *     302 => secondary
 *     4XX => error
 */
const getCodeColors = (status: string) => {
  switch (true) {
    case /1(X{2}|\d{2})/.test(status):
      return 'primary'
    case /2(X{2}|\d{2})/.test(status):
      return 'success'
    case /3(X{2}|\d{2})/.test(status):
      return 'secondary'
    case /418/.test(status):
      return '#E040FB'
    case /4(X{2}|\d{2})/.test(status):
      return 'warning'
    case /5(X{2}|\d{2})/.test(status):
      return 'error'
    default:
      return 'default'
  }
}

</script>

<style scoped>
</style>
