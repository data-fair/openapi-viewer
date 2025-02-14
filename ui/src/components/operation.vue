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

  <v-col cols="6">
    <v-expansion-panels
      v-model="panel"
      variant="default"
      multiple
    >
      <v-expansion-panel
        value="security"
        static
      >
        <template #title>
          <h2>Request</h2>
        </template>
        <template #text>
          <div>
            <v-row>
              <v-col cols="6">
                <h3>
                  x-apiKey
                  <v-chip
                    size="small"
                    density="compact"
                    class="mr-2"
                    text="Required"
                    color="error"
                    :prepend-icon="mdiAsterisk"
                  />
                </h3>
                <div
                  v-html="marked('Clé d\'API **DataFair**')"
                />
                <div class="text-caption">
                  Location: header
                </div>
                <div class="text-caption">
                  Type: apiKey
                </div>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="x-apiKey"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-2" />

          <div>
            <v-row>
              <v-col cols="6">
                <h3>
                  id_token
                  <v-chip
                    size="small"
                    density="compact"
                    class="mr-2"
                    text="Deprecated"
                    color="warning"
                    :prepend-icon="mdiAlertCircle"
                  />
                </h3>
                <div class="text-caption">
                  Location: cookie
                </div>
                <div class="text-caption">
                  Type: apiKey
                </div>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="id_token"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </div>
        </template>
      </v-expansion-panel>

      <v-expansion-panel
        value="parameters"
        static
      >
        <template #title>
          <h2>Parameters</h2>
        </template>
        <template #text>
          <div>
            <v-row>
              <v-col cols="6">
                <h3>
                  q
                </h3>
                <div
                  v-html="marked('Recherche textuelle')"
                />
                <div class="text-caption">
                  Location: query
                </div>
                <div class="text-caption">
                  Type: string
                </div>

                <!-- Examples -->
                <div class="text-caption">
                  <span class="font-weight-bold">Examples:</span><br>
                  Valeur pour vrai (summary)<br>
                  Un exemple de valeur pour vrai (description)<br>
                  <code>
                    true
                  </code>
                  <v-divider />
                  Valeur pour faux (summary)<br>
                  Un exemple de valeur pour faux (description)<br>
                  <code>
                    false
                  </code>
                </div>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="q"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-2" />

          <div>
            <v-row>
              <v-col cols="6">
                <h3>
                  mine
                </h3>
                <div
                  v-html="marked('Voir uniquement les ressources de mon compte actif')"
                />
                <div class="text-caption">
                  Location: query
                </div>
                <div class="text-caption">
                  Type: boolean
                </div>
                <!-- Examples -->
                <div class="text-caption">
                  <span class="font-weight-bold">Example:</span><br>
                  <code>
                    false
                  </code>
                </div>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  label="mine"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-2" />

          <div>
            <v-row>
              <v-col cols="6">
                <h3>
                  select
                  <v-chip
                    size="small"
                    density="compact"
                    class="mr-2"
                    text="Required"
                    color="error"
                    :prepend-icon="mdiAsterisk"
                  />
                </h3>
                <div
                  v-html="marked('La liste des **colonnes** à retourner')"
                />
                <div class="text-caption">
                  Location: query
                </div>
                <div class="text-caption">
                  Type: array&lt;string&gt;
                </div>
                <div class="text-caption">
                  <span class="font-weight-bold">Values:</span> id, slug, href, page, title, description, image, spatial, temporal, keywords, frequency, file, originalFile, attachments, remoteFile, storage, createdAt, createdBy, updatedAt, updatedBy, dataUpdatedAt, dataUpdatedBy, finalizedAt, owner, status, errorStatus, errorRetry, primaryKey, schema, count, bbox, timePeriod, timeZone, projection, license, origin, extensions, masterData, publications, publicationSites, requestedPublicationSites, hasFiles, attachmentsAsImage, isVirtual, virtual, isRest, rest, isMetaOnly, topics, thumbnails, exports, extras, analysis, permissions, previews, readApiKey, esWarning, draft
                </div>
                <!-- Examples -->
                <div class="text-caption">
                  <span class="font-weight-bold">Example:</span><br>
                  Voir la documentation externe<br>
                  Ce lien fournit un example très détaillé du fonctionnement de ce parametre<br>
                  <a
                    href="https://docs.koumoul.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://docs.koumoul.com/
                  </a>
                </div>
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  label="select"
                  clearable
                  multiple
                  :items="[ 'id', 'slug', 'href', 'page', 'title', 'description', 'image', 'spatial', 'temporal', 'keywords', 'frequency', 'file', 'originalFile', 'attachments', 'remoteFile', 'storage', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'dataUpdatedAt', 'dataUpdatedBy', 'finalizedAt', 'owner', 'status', 'errorStatus', 'errorRetry', 'primaryKey', 'schema', 'count', 'bbox', 'timePeriod', 'timeZone', 'projection', 'license', 'origin', 'extensions', 'masterData', 'publications', 'publicationSites', 'requestedPublicationSites', 'hasFiles', 'attachmentsAsImage', 'isVirtual', 'virtual', 'isRest', 'rest', 'isMetaOnly', 'topics', 'thumbnails', 'exports', 'extras', 'analysis', 'permissions', 'previews', 'readApiKey', 'esWarning', 'draft' ]"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </div>
        </template>
      </v-expansion-panel>

      <v-expansion-panel
        value="requestBody"
        static
      >
        <template #title>
          <div class="d-flex justify-space-between w-100">
            <div class="d-flex align-center">
              <h2 class="mt-0">
                Request body
              </h2>
              <v-chip
                size="small"
                density="compact"
                class="ml-2"
                text="Required"
                color="error"
                :prepend-icon="mdiAsterisk"
              />
            </div>

            <div class="d-flex align-center mx-2">
              <v-select
                v-model="contentType"
                label="Content-Type"
                :items="[
                  'application/json',
                  'application/xml',
                  'application/x-www-form-urlencoded',
                  'multipart/form-data'
                ]"
                hide-details="auto"
                density="compact"
                @click.stop
              />
            </div>
          </div>
        </template>

        <template #text>
          <v-row>
            <v-col cols="6">
              <div
                v-html="marked('Fichier à charger et autres informations')"
              />
              <v-tabs
                v-model="tab"
              >
                <v-tab value="examples">
                  Examples
                </v-tab>
                <v-tab value="schema">
                  Schema
                </v-tab>
              </v-tabs>

              <v-card
                class="overflow-auto"
                max-height="400"
              >
                <v-card-text>
                  <v-tabs-window
                    v-model="tab"
                  >
                    <v-tabs-window-item value="examples">
                      <pre>
                        <code>
{
  "name": "John Doe",
  "age": 30,
  "cars": [
    {
      "name": "Ford",
      "models": [
        "Fiesta",
        "Focus",
        "Mustang"
      ]
    },
    {
      "name": "BMW",
      "models": [
        "320",
        "X3",
        "X5"
      ]
    }
  ],
  "address": {
    "street": "Main Streethfghhhhhhhhhhhhhhhhhhhhhhh gfffffffffffffffff reeeeeeeeeeeeeeee dsssssssssss hgggggggggg",
    "city": "New York"
  },
  "isMarried": true,
  "spouse": {
    "name": "Jane Doe",
    "age": 25
  },
  "children": [
    {
      "name": "Alice",
      "age": 5
    },
    {
      "name": "Bob",
      "age": 3
    }
  ]
}
                        </code>
                      </pre>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="schema">
                      Two
                    </v-tabs-window-item>
                  </v-tabs-window>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-textarea
                label="Payload"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </template>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- <v-form>
      <vjsf
        v-model="endpointQueryValues"
        :schema="endpointQuerySchema"
        :options="vjsfOptions"
      />
    </v-form> -->
  </v-col>

  <v-fab
    color="primary"
    location="right bottom"
    size="large"
    :app="true"
    icon
  >
    <v-icon :icon="mdiPlay" />
    <v-tooltip
      activator="parent"
      location="left"
      text="Execute"
    />
  </v-fab>
</template>

<script setup lang="ts">
import type { Operation, PathItem } from '#api/types'
import type { SchemaObject } from 'ajv'

import { marked } from 'marked'
import Vjsf from '@koumoul/vjsf'

// Maquette
const panel = ref<string[]>(['security', 'parameters', 'requestBody'])
const tab = ref<string>('examples')
const contentType = ref<string>('application/json')
// ------------------

// Type de sortie de VJSF
type GenericEndpointQuery = {
  header: Record<string, string>,
  path: Record<string, string>,
  query: Record<string, string>,
  body: any
}

const { operation, pathItemParameters } = defineProps<{
  operation: Operation
  pathItemParameters: PathItem['parameters']
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
})

watch(() => operation, () => {
  endpointQuerySchema.value = getVJSFSchema(operation, pathItemParameters)
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
