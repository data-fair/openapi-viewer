<template>
  <v-row>
    <v-col cols="8">
      <h1>
        {{ info.title }}
        <v-chip
          density="compact"
          :prepend-icon="mdiLabel"
          :text="info.version"
        />
      </h1>
      <div
        v-if="info.summary"
        class="text-h6 font-italic"
      >
        {{ info.summary }}
      </div>

      <div
        v-if="info.description"
        v-html="marked(info.description)"
      />

      <h2 class="mt-2">
        Serveurs
      </h2>
      <v-list
        class="pt-0"
        density="compact"
        style="background-color:transparent"
      >
        <v-list-item
          v-for="server in servers"
          :key="server.url"
        >
          <template #title>
            <span class="text-h6">
              {{ server.url }}
            </span>
            <span v-if="server.description">
              - {{ server.description }}
            </span>
          </template>
        </v-list-item>
      </v-list>

      <template v-if="schemas">
        <h2 class="mt-2">
          Schemas
        </h2>
        <v-list
          class="pt-0"
          density="compact"
          style="background-color:transparent"
        >
          <v-list-item
            v-for="(schema, index) in schemas"
            :key="index"
            @click="openSchemaDialog(schema.title as string, schema)"
          >
            <template #title>
              <span class="text-h6">{{ schema.title }}</span>
            </template>
          </v-list-item>
        </v-list>

        <!-- Dialog pour afficher le schéma -->
        <v-dialog
          v-model="dialog"
          max-width="800"
        >
          <template #default>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ selectedSchemaName }}</span>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <schema-viewer :json-schema="selectedSchema" />
              </v-card-text>
            </v-card>
          </template>
        </v-dialog>
      </template>
    </v-col>
    <v-col cols="4">
      <v-card
        variant="elevated"
      >
        <v-list
          density="compact"
          nav
        >
          <!-- Contact Informations -->
          <v-list-item
            v-if="info.contact?.url"
            :href="info.contact.url"
            target="_blank"
            nav
          >
            <template #prepend>
              <v-icon
                color="primary"
                :icon="mdiHome"
              />
            </template>
            {{ info.contact.name || info.contact.url }}
          </v-list-item>
          <v-list-item
            v-else-if="info.contact?.name"
            nav
          >
            <template #prepend>
              <v-icon
                color="primary"
                :icon="mdiHome"
              />
            </template>
            {{ info.contact.name }}
          </v-list-item>
          <v-list-item
            v-if="info.contact?.email"
            :href="'mailto:' + info.contact.email"
            target="_blank"
            nav
          >
            <template #prepend>
              <v-icon
                color="primary"
                :icon="mdiEmail"
              />
            </template>
            {{ info.contact.email }}
          </v-list-item>

          <!-- License Informations -->
          <v-list-item
            v-if="info.license?.url"
            :href="info.license.url"
            target="_blank"
            nav
          >
            <template #prepend>
              <v-icon
                color="primary"
                :icon="mdiSecurity"
              />
            </template>
            {{ info.license.name || info.license.url }}
          </v-list-item>
          <v-list-item
            v-else-if="info.license?.name"
            nav
          >
            <template #prepend>
              <v-icon
                color="primary"
                :icon="mdiSecurity"
              />
            </template>
            {{ info.license.name }}
          </v-list-item>

          <!-- External Documentation -->
          <v-list-item
            v-if="externalDocs"
            :href="externalDocs.url"
            target="_blank"
            nav
          >
            <template #prepend>
              <v-icon
                color="primary"
                :icon="mdiBookOpenVariant"
              />
            </template>
            {{ externalDocs?.description || 'Documentation externe' }}
          </v-list-item>

          <!-- Terms of Service -->
          <v-list-item
            v-if="info.termsOfService"
            :href="info.termsOfService"
            target="_blank"
            nav
          >
            <template #prepend>
              <v-icon
                color="primary"
                :icon="mdiGavel"
              />
            </template>
            Terms of Service
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { OpenAPISpecs, Components } from '#api/types'

import { marked } from 'marked'

const { info, externalDocs, servers, schemas } = defineProps<{
  info: OpenAPISpecs['info'],
  externalDocs: OpenAPISpecs['externalDocs'],
  servers: OpenAPISpecs['servers'],
  schemas: Components['schemas'] | undefined
}>()

const dialog = ref(false)
const selectedSchema = ref<any>(null)
const selectedSchemaName = ref<string>('')

function openSchemaDialog (name: string, schema: any) {
  selectedSchema.value = schema
  selectedSchemaName.value = name
  dialog.value = true
}
</script>

<style scoped>
</style>
