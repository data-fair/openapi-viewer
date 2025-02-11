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

  // Formulaire VJSF
  Si le champ de sécurité est global, il devrai être conservé entre les pages.
  tout le reste est reset au changement de hash
  Le formulaire VJSF :
  - Security -> Les cookies sont en readonly, query et header non
  -          -> Pour chaque, on doit afficher proprement le nom, le type et la location, la description markdown et demander la valeur
  -          -> Partie global et partie par opération

  - Server -> si qu'un seul serveur on on affiche même pas le choix

  // Securities form
  <v-form>
    <vjsf
      v-if="securities.length"
      v-model="securitiesValues"
      :schema="secutiriesSchema"
      :options="vjsfOptions"
    />
  </v-form>
  {{ securities }}

  <pre>
    {{ operation }}
  </pre>

  // TODO afficher les champs étendu ? (x-...)
</template>

<script setup lang="ts">
import type { OpenAPISpecs, Operation } from '../../../api/types/OpenAPISpecs'
import { marked } from 'marked'
import Vjsf from '@koumoul/vjsf'

const { operation, servers, security, securitySchemes } = defineProps<{
  operation: Operation
  servers: OpenAPISpecs['servers']
  security: OpenAPISpecs['security']
  securitySchemes: Record<string, any[]> | undefined
}>()

const securities = computed<{
  type: 'apiKey' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect'
  name: string
  in: 'query' | 'header' | 'cookie'
  description?: string
}[]>(() => {
  if (!securitySchemes) return []
  const globalSecurities = security?.map(sec => {
    return securitySchemes[Object.keys(sec)[0]]
  }).filter(Boolean) || []

  const operationSecurities = operation.security?.map(sec => {
    return securitySchemes[Object.keys(sec)[0]]
  }).filter(Boolean) || []

  return [...globalSecurities, ...operationSecurities] as any
})

const securitiesValues = ref(securities.value)

// Schema VJSF
const secutiriesSchema = {
  type: 'array',
  title: 'Security',
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

</script>

<style scoped>
</style>
