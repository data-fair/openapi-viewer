<template>
  <v-tabs
    v-model="panelRight"
  >
    <v-tab value="serverResponse">
      {{ t('serverResponse') }}
    </v-tab>
    <v-tab
      value="responses"
    >
      {{ t('responses') }}
    </v-tab>
  </v-tabs>

  <v-tabs-window v-model="panelRight">
    <v-tabs-window-item value="serverResponse">
      <v-row justify="center">
        <v-btn
          class="my-4"
          color="primary"
          :prepend-icon="mdiPlay"
          :loading="loading"
          :disabled="loading"
          @click="emit('executeRequest')"
        >
          {{ t('execute') }}
        </v-btn>
      </v-row>

      <template v-if="responseData">
        <h4>
          <v-chip
            :color="getCodeColors(responseData.status)"
            :text="responseData.status"
            density="compact"
            variant="elevated"
            label
          />
          {{ responseData.statusText }}
        </h4>
        <template v-if="responseData.body">
          <h4>{{ t('responseBody') }}</h4>
          <span
            v-if="!responseData.type"
            class="font-italic"
          >
            {{ t('parsingFailed') }}
          </span>
          <prism
            v-else-if="responseData.type === 'json'"
            language="json"
            max-height="500px"
            copy
          >
            {{ JSON.stringify(responseData.body, null, 2) }}
          </prism>
          <template v-else-if="responseData.type === 'image'">
            <v-img
              :src="responseData.body"
              alt="Response Image"
            />
          </template>
          <prism
            v-else
            max-height="500px"
            copy
          >
            {{ responseData.body }}
          </prism>
        </template>
        <template v-if="responseData.headers">
          <h4>{{ t('responseHeaders') }}</h4>
          <prism
            language="yaml"
            max-height="500px"
          >
            {{ YAML.stringify(responseData.headers) }}
          </prism>
        </template>
      </template>
      <template v-else>
        <p class="text-muted">
          {{ t('noResponses') }}
        </p>
      </template>
    </v-tabs-window-item>

    <v-tabs-window-item value="responses">
      <responses
        v-if="operation.responses"
        :responses="operation.responses"
      />
      <template v-else>
        <p class="text-muted">
          {{ t('noDocsResponses') }}
        </p>
      </template>
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup lang="ts">
import type { Operation } from '#api/types'
import YAML from 'yaml'

const { operation, responseData } = defineProps<{
  operation: Operation
  responseData: Record<string, any> | null
  loading: boolean
}>()

const emit = defineEmits(['executeRequest'])

const { t } = useI18n()

const panelRight = ref<string>('serverResponse')

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
      return '#B388FF'
    case /4(X{2}|\d{2})/.test(status):
      return 'warning'
    case /5(X{2}|\d{2})/.test(status):
      return 'error'
    default:
      return 'default'
  }
}

</script>

<i18n lang="yaml">
  en:
    execute: "Execute"
    noDocsResponses: "No response documentation."
    noResponses: "No responses received yet."
    parsingFailed: "Unable to parse response."
    responseBody: "Response Body"
    responseHeaders: "Response Headers"
    responses: Responses
    serverResponse: "Try it out"
  fr:
    execute: "Exécuter"
    noDocsResponses: "Aucune documentation de réponse."
    noResponses: "Aucune réponse reçue pour le moment."
    parsingFailed: "Impossible de parser la réponse."
    responseBody: "Corps de la réponse"
    responseHeaders: "En-têtes de la réponse"
    responses: Réponses
    serverResponse: "Essayer"
</i18n>

<style scoped>
</style>
