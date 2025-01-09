<template>
  <h1>{{ info.title }}</h1>
  <div v-if="info.summary">
    {{ info.summary }}
  </div>

  <div
    v-if="info.description"
    v-html="marked(info.description || '')"
  />

  <v-list>
    <!-- Contact Informations -->
    <v-list-item
      v-if="info.contact?.url"
      :href="info.contact.url"
      target="_blank"
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
    >
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiSecurity"
        />
      </template>
      {{ info.license.name }}
    </v-list-item>

    <!-- API Version -->
    <v-list-item
      v-if="info.termsOfService"
    >
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiLabel"
        />
      </template>
      {{ info.version }}
    </v-list-item>

    <!-- Terms of Service -->
    <v-list-item
      v-if="info.termsOfService"
      :href="info.termsOfService"
      target="_blank"
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
</template>

<script setup lang="ts">
import type { OpenAPISpecs } from '#api/types'

import { marked } from 'marked'

const { info } = defineProps<{ info: OpenAPISpecs['info'] }>()
</script>

<style scoped>
</style>
