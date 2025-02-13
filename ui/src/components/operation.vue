<template>
  <h1>
    {{ operation.summary }}
    <v-chip
      v-if="operation.deprecated"
      density="compact"
      color="warning"
      :prepend-icon="mdiAlertCircle"
    >
      Déprécié
    </v-chip>
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

  <v-col cols="6">
    <v-form>
      <vjsf
        v-model="endpointQueryValues"
        :schema="endpointQuerySchema"
        :options="vjsfOptions"
      />
    </v-form>
  </v-col>
</template>

<script setup lang="ts">
import type { Operation } from '#api/types'
import type { SchemaObject } from 'ajv'

import { marked } from 'marked'
import Vjsf from '@koumoul/vjsf'

// Type de sortie de VJSF
type GenericEndpointQuery = {
  header: Record<string, string>,
  path: Record<string, string>,
  query: Record<string, string>,
  body: any
}

const { operation } = defineProps<{
  operation: Operation
}>()

const endpointQueryValues = ref<GenericEndpointQuery>({
  header: {},
  path: {},
  query: {},
  body: {}
})

const endpointQuerySchema = ref<SchemaObject | undefined>({})

onMounted(() => {
  endpointQuerySchema.value = getVJSFSchema(operation)
})

watch(() => operation, () => {
  endpointQuerySchema.value = getVJSFSchema(operation)
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
