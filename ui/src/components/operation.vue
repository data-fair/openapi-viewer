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

      <v-row justify="center">
        <v-btn
          class="mt-4"
          variant="text"
          color="primary"
        />
      </v-row>
    </v-col>

    <v-col cols="6">
      <operation-pannel-right
        :operation="operation"
        :endpoint-query-values="endpointQueryValues"
        :server-url="serverUrl"
        :method="method"
        :path="path"
      />
    </v-col>
  </v-row>
  {{ endpointQuerySchema }}
</template>

<script setup lang="ts">
import type { GenericEndpointQuery, Operation } from '#api/types'
import type { Parameter } from '~/utils/transform'
import type { SchemaObject } from 'ajv'
import { marked } from 'marked'
import Vjsf from '@koumoul/vjsf'
import prism from '~/components/prism.ts'

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

onMounted(() => {
  endpointQuerySchema.value = getVJSFSchema(operation, pathItemParameters)
})

watch(() => operation, () => {
  endpointQuerySchema.value = getVJSFSchema(operation, pathItemParameters)
  endpointQueryValues.value = {}
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
