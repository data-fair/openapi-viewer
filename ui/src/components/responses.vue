<template>
  <v-expansion-panel
    v-if="responses"
    value="responses"
    static
  >
    <template #title>
      <h3>Responses</h3>
    </template>
    <template #text>
      <!-- Responses codes selector -->
      <v-tabs
        :key="Object.keys(responses).join('-')"
        v-model="selectedCode"
      >
        <v-tab
          v-for="code in orderedCodes"
          :key="code"
          :base-color="getCodeColors(code)"
          :value="code"
        >
          <v-chip
            :color="getCodeColors(code)"
            :text="code"
            density="compact"
            label
          />
        </v-tab>
      </v-tabs>

      <v-tabs-window
        v-model="selectedCode"
      >
        <!-- One response object -->
        <v-tabs-window-item
          v-for="({ response, code }) in sortedResponses"
          :key="code"
          :value="code"
        >
          <!-- Description -->
          <div
            v-if="response.description"
            class="mb-4 mt-2"
            v-html="marked(response.description)"
          />

          <!-- Content -->
          <template v-if="response.content">
            <v-row>
              <v-col cols="auto">
                <v-tabs
                  v-model="examplesOrSchemaTab[code][selectedContentType[code]]"
                >
                  <v-tab
                    v-if="response.content[selectedContentType[code]]?.schema"
                    value="schema"
                  >
                    Schema
                  </v-tab>
                  <v-tab
                    v-if="response.content[selectedContentType[code]]?.examples || response.content[selectedContentType[code]]?.example"
                    value="examples"
                  >
                    Examples
                  </v-tab>
                </v-tabs>
              </v-col>
              <v-col cols="auto">
                <v-select
                  v-model="selectedContentType[code]"
                  density="compact"
                  hide-details="auto"
                  label="Content-Type"
                  :items="Object.keys(response.content)"
                />
              </v-col>
            </v-row>
            <v-tabs-window
              v-model="examplesOrSchemaTab[code][selectedContentType[code]]"
            >
              <v-tabs-window-item value="schema">
                <prism
                  :key="code + selectedContentType[code] + '-schema'"
                  language="json"
                  max-height="400px"
                >
                  {{ JSON.stringify(response.content[selectedContentType[code]]?.schema, null, 2) }}
                </prism>
              </v-tabs-window-item>

              <v-tabs-window-item value="examples">
                <v-select
                  v-if="response.content[selectedContentType[code]]?.examples"
                  v-model="selectedExample[code][selectedContentType[code]]"
                  density="compact"
                  hide-details="auto"
                  label="Select Example"
                  :items="Object.entries(response.content[selectedContentType[code]].examples!).map(([key, example]) => ({ key, title: example.summary || key }))"
                  item-title="title"
                  item-value="key"
                />
                <prism
                  v-if="response.content[selectedContentType[code]]?.examples && selectedExample[code][selectedContentType[code]]"
                  language="json"
                  max-height="400px"
                >
                  {{ JSON.stringify(response.content[selectedContentType[code]].examples![selectedExample[code][selectedContentType[code]]].value, null, 2) }}
                </prism>
                <prism
                  v-else-if="response.content[selectedContentType[code]]?.example"
                  language="json"
                  max-height="400px"
                >
                  {{ JSON.stringify(response.content[selectedContentType[code]].example, null, 2) }}
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
</template>

<script setup lang="ts">
import type { Operation, MediaType } from '#api/types'
import { marked } from 'marked'

type Response = {
  description?: string
  content?: Record<string, MediaType>
  headers?: Record<string, any>
  links?: Record<string, any>
}

const { responses } = defineProps<{
  responses: Operation['responses']
}>()

const selectedCode = ref<string>('default') // Ex: 200
const selectedContentType = ref<Record<string, string>>({}) // Ex: { 200: 'application/json', 404: 'application/xml' }
const examplesOrSchemaTab = ref<Record<string, Record<string, string>>>({}) // { 200: { 'application/json': 'schema' } }
const selectedExample = ref<Record<string, Record<string, string>>>({}) // { 200: { 'application/json': 'example1' } }

const orderedCodes = computed(() => {
  return Object.keys(responses || {}).sort((a, b) => {
    const customOrder = (code: string) => {
      if (code.endsWith('XX')) return parseInt(code[0]) * 100
      return parseInt(code)
    }

    return customOrder(a) - customOrder(b)
  })
})

const sortedResponses = computed(() => {
  return orderedCodes.value.map((code) => ({
    code,
    response: responses![code] as Response
  }))
})

watch(() => responses, () => {
  if (responses && Object.keys(responses).length) {
    selectedCode.value = orderedCodes.value[0] // Select default code
    Object.keys(responses).forEach(code => {
      const response = responses[code] as Response
      if (response.content && Object.keys(response.content).length) {
        selectedContentType.value[code] = Object.keys(response.content)[0] // Select default content type
        Object.keys(response.content).forEach(contentType => {
          const content = response.content![contentType]
          if (content.examples || content.example) {
            examplesOrSchemaTab.value[code] = { [contentType]: 'examples' } // Select examples tab
            if (content.examples && Object.keys(content.examples).length) {
              if (!selectedExample.value[code]) {
                selectedExample.value[code] = { [contentType]: Object.keys(content.examples)[0] } // Select default example
              } else {
                selectedExample.value[code][contentType] = Object.keys(content.examples)[0] // Select default example
              }
            }
          }
          if (content.schema) {
            examplesOrSchemaTab.value[code] = { [contentType]: 'schema' } // Select schema tab
          }
        })
      }
    })
  }
}, { immediate: true })

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
