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

  <pre>
    Securities :
    {{ securities }}

    Operation :
    {{ operation }}
  </pre>

  // TODO afficher les champs étendu ? (x-...)
</template>

<script setup lang="ts">
import type { Operation, SecurityRequirement, Server, SecuritySchemeOrReference } from '#api/types'
import { marked } from 'marked'
import Vjsf from '@koumoul/vjsf'

const { operation, servers, globalSecurities, securitySchemes } = defineProps<{
  operation: Operation
  servers: Server[] | undefined
  globalSecurities: SecurityRequirement[] | undefined
  securitySchemes: SecuritySchemeOrReference | undefined // A json schema
}>()

const securities = computed<{
  type: 'apiKey' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect'
  name: string
  in: 'query' | 'header' | 'cookie'
  description?: string
}[]>(() => {
  if (!securitySchemes) return []
  const globalS = globalSecurities?.map(sec => {
    return securitySchemes[Object.keys(sec)[0]]
  }).filter(Boolean) || []

  const operationS = operation.security?.map(sec => {
    return securitySchemes[Object.keys(sec)[0]]
  }).filter(Boolean) || []

  return [...globalS, ...operationS] as any
})

/*
type GenericEndpointQuery = {
  headers: {
    [k: string]: string
  }
}

const endpointQuerySchema: any = {
  type: 'object',
  properties: {
    headers: {
      type: 'object',
      properties: {
        'apiKey': {
          type: 'string',
          description: `Key=apiKey\n\nMa description`
        }
      }
    }
  }
}

// Schema VJSF
const secutiriesSchema = {
  type: 'array',
  title: 'Security',
  layout: {
    listEditMode: 'inline',
    listActions: []
  },
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        readOnly: true
      },
      description: {
        type: 'string',
        title: 'Description',
        readOnly: true
      },
      in: {
        type: 'string',
        title: 'Location',
        readOnly: true,
        layout: {
          cols: 6
        }
      },
      type: {
        type: 'string',
        title: 'Type',
        readOnly: true,
        layout: {
          cols: 6
        }
      },
      value: {
        type: 'string'
      }
    }
  }
}

const vjsfOptions = {
  density: 'comfortable',
  initialValidation: 'always',
  updateOn: 'blur',
  validateOn: 'blur',
  locale: 'fr',
  titleDepth: 3
}
  */

</script>

<style scoped>
</style>
