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
      target="_blank"
      rel="noopener noreferrer"
      :prepend-icon="mdiBookOpenVariant"
      :text="operation.externalDocs.description"
      :href="operation.externalDocs.url"
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
                    style="max-height: 400px;"
                  >
                    {{ JSON.stringify(schema, null, 2) }}
                  </prism>
                </v-tabs-window-item>
                <v-tabs-window-item value="examples">
                  <prism
                    :key="examples"
                    language="json"
                    style="max-height: 400px;"
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
    </v-col>

    <v-col cols="6">
      <v-expansion-panels
        v-model="panelRight"
        multiple
      >
        <v-expansion-panel
          value="snippet"
          static
        >
          <template #title>
            <h2>Curl / Url</h2>
          </template>
          <template #text>
            <h3>Curl command</h3>
            <prism
              language="bash"
              style="max-height: 400px;"
            >
              curl -X GET "https://api.datafair.io/v1/datasets" -H "accept: application/json" -H "x-apiKey: YOUR_API
            </prism>
            <h3>Request URL</h3>
            <prism
              language="bash"
              style="max-height: 400px;"
            >
              https://api.datafair.io/v1/datasets
            </prism>
          </template>
        </v-expansion-panel>

        <v-expansion-panel
          value="serverResponse"
          static
        >
          <template #title>
            <h2>Server Response</h2>
          </template>
          <template #text>
            <!-- TODO -->TODO
          </template>
        </v-expansion-panel>

        <v-expansion-panel
          v-if="operation.responses"
          value="responses"
          static
        >
          <template #title>
            <h2>Responses</h2>
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
                        :key="response.content"
                        language="json"
                        style="max-height: 400px;"
                      >
                        {{ JSON.stringify(response.content[responsesContentType[status]]?.schema, null, 2) }}
                      </prism>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="examples">
                      <prism
                        language="json"
                        style="max-height: 400px;"
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
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Operation } from '#api/types'
import type { Parameter } from '~/utils/transform'
import type { SchemaObject } from 'ajv'

import { marked } from 'marked'
import Vjsf from '@koumoul/vjsf'

import 'prismjs'
import 'prismjs/themes/prism-okaidia.min.css'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-bash.js'
import Prism from 'vue-prism-component'

const panelRight = ref<string[]>(['snippet', 'serverResponse', 'responses'])
const responsesCodeTab = ref<string>('default')
const responsesContentType = ref<Record<string, string>>({})
const responsesExamplesSchemaTab = ref<Record<string, string>>({})
const schemaExamplesTab = ref<string>('schema')

// Type de sortie de VJSF
type GenericEndpointQuery = {
  header?: Record<string, string>,
  path?: Record<string, string>,
  query?: Record<string, string>,
  body?: any
}

type Response = {
  description?: string
  content?: Record<string, { schema?: SchemaObject }>
  headers?: Record<string, any>
  links?: Record<string, any>
}

const { operation, pathItemParameters } = defineProps<{
  operation: Operation
  pathItemParameters: Parameter[]
}>()

const endpointQueryValues = ref<GenericEndpointQuery>({
  header: {},
  path: {},
  query: {},
  body: {}
})

const endpointQuerySchema = ref<SchemaObject>({})

onMounted(() => {
  endpointQuerySchema.value = getVJSFSchema(operation, pathItemParameters)
  if (operation.responses) {
    if (Object.keys(operation.responses).length) {
      Object.keys(operation.responses).forEach(status => {
        if (operation.responses![status].content) {
          responsesContentType.value[status] = Object.keys(operation.responses![status].content)[0]
        }
      })
      responsesCodeTab.value = Object.keys(operation.responses)[0]
    }
  }
})

watch(() => operation, () => {
  endpointQuerySchema.value = getVJSFSchema(operation, pathItemParameters)
  endpointQueryValues.value = {}

  if (operation.responses && Object.keys(operation.responses).length) {
    Object.keys(operation.responses).forEach(status => {
      if (operation.responses![status].content) {
        responsesContentType.value[status] = Object.keys(operation.responses![status].content)[0]
      }
    })
    responsesCodeTab.value = Object.keys(operation.responses)[0]
  }
})

const vjsfOptions = {
  density: 'comfortable',
  initialValidation: 'always',
  updateOn: 'blur',
  validateOn: 'blur',
  locale: 'fr',
  titleDepth: 3
}

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
