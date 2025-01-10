<template>
  <v-row>
    <v-col cols="8">
      <h1>
        {{ info.title }}
        <v-chip
          density="compact"
          :prepend-icon="mdiLabel"
        >
          {{ info.version }}
        </v-chip>
      </h1>
      <div
        v-if="info.summary"
        class="text-h6 font-italic"
      >
        {{ info.summary }}
      </div>

      <div
        v-if="info.description"
        v-html="marked(info.description || '')"
      />

      <h2>Serveurs</h2>
    </v-col>
    <v-col cols="4">
      <v-card
        variant="elevated"
      >
        <v-list
          style="background-color: transparent;"
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
import type { OpenAPISpecs } from '#api/types'

import { marked } from 'marked'

const { info, externalDocs } = defineProps<{ info: OpenAPISpecs['info'], externalDocs: OpenAPISpecs['externalDocs'] }>()
</script>

<style scoped>
</style>
