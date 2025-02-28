<template>
  <v-row>
    <v-col cols="8">
      <!-- Title & Version -->
      <h1>
        {{ info.title }}
        <v-chip
          density="compact"
          :prepend-icon="mdiLabel"
          :text="info.version"
        />
      </h1>

      <!-- Summary -->
      <div
        v-if="info.summary"
        class="text-h6 font-italic"
      >
        {{ info.summary }}
      </div>

      <!-- Description -->
      <div
        v-if="info.description"
        v-html="marked(info.description)"
      />

      <!-- Schemas -->
      <template v-if="schemas">
        <h2 class="mt-2">
          {{ t('schemas') }}
        </h2>
        <v-expansion-panels
          v-model="schemaPannel"
          density="compact"
        >
          <v-expansion-panel
            v-for="(schema, index) in schemas"
            :key="index"
            :value="index"
            static
          >
            <template #title>
              {{ schema.title || index }}
            </template>
            <template #text>
              <schema-viewer :json-schema="schema" />
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>

      <!-- Servers -->
      <template v-if="servers">
        <h2 class="mt-2">
          {{ t('servers') }}
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
              <p class="text-wrap">
                <strong>{{ server.url }}</strong>
                <span v-if="server.description">
                  - {{ server.description }}
                </span>
              </p>
            </template>
          </v-list-item>
        </v-list>
      </template>
    </v-col>

    <v-col cols="4">
      <v-card
        v-if="info.contact || info.license || externalDocs || info.termsOfService"
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
            {{ externalDocs?.description || t('externalDoc') }}
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
            {{ t('termsOfService') }}
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

const { t } = useI18n()

const schemaPannel = ref<number | null>(null)

</script>

<i18n lang="yaml">
  en:
    externalDoc: "External Documentation"
    schemas: "Schemas"
    servers: "Servers"
    termsOfService: "Terms of Service"
  fr:
    externalDoc: "Documentation Externe"
    schemas: "Schémas"
    servers: "Serveurs"
    termsOfService: "Conditions d'utilisation"
</i18n>

<style scoped>
</style>
