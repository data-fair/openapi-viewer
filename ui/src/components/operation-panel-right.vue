<template>
  <v-tabs v-model="panelRight">
    <v-tab value="serverResponse">
      {{ t('serverResponse') }}
    </v-tab>
    <v-tab value="responses">
      {{ t('responses') }}
    </v-tab>
  </v-tabs>

  <v-tabs-window v-model="panelRight">
    <v-tabs-window-item value="serverResponse">
      <v-menu
        v-if="method.toUpperCase() === 'DELETE'"
        v-model="showDeleteMenu"
        :close-on-content-click="false"
        max-width="500"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="my-4"
            color="primary"
            :prepend-icon="mdiPlay"
            :loading="loading"
            :disabled="loading || !isValid"
          >
            {{ t('execute') }}
          </v-btn>
        </template>
        <v-card
          rounded="lg"
          variant="elevated"
        >
          <v-card-text>
            <v-alert
              type="warning"
              variant="outlined"
              :title="t('sensitiveOperation')"
              :text="t('deleteConfirmation')"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              @click="showDeleteMenu = false"
            >
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              color="warning"
              variant="flat"
              @click="showDeleteMenu = false; emit('executeRequest')"
            >
              {{ t('execute') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
      <v-btn
        v-else
        class="my-4"
        color="primary"
        :prepend-icon="mdiPlay"
        :loading="loading"
        :disabled="loading || !isValid"
        @click="emit('executeRequest')"
      >
        {{ t('execute') }}
      </v-btn>

      <template v-if="responseData">
        <h4>
          {{ t('requestUrl') }}
        </h4>
        <p class="text-break">
          {{ requestUrl }}
        </p>
        <h4>
          {{ t('status') }}
        </h4>
        <v-chip
          :color="getCodeColors(responseData.status)"
          :text="responseData.status"
          density="compact"
          variant="elevated"
          label
        />
        {{ responseData.statusText || getDefaultStatusText(responseData.status) }}
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
            {{ YAML.dump(responseData.headers) }}
          </prism>
        </template>
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
import YAML from 'js-yaml'
import status from 'statuses'

const { operation, method, responseData, loading, isValid } = defineProps<{
  operation: Operation
  method: string
  requestUrl: string
  responseData: Record<string, any> | null
  loading: boolean
  isValid: boolean | null
}>()

const emit = defineEmits(['executeRequest'])

const { t } = useI18n()

const panelRight = ref<string>('serverResponse')
const showDeleteMenu = ref<boolean>(false)

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

/*
 * Get default status text for HTTP status codes using the statuses library
 */
const getDefaultStatusText = (statusCode: number | string): string => {
  const code = typeof statusCode === 'string' ? parseInt(statusCode) : statusCode
  return status.message[code] || 'Unknown Status'
}

</script>

<i18n lang="yaml">
  en:
    cancel: "Cancel"
    deleteConfirmation: "Are you sure you want to perform this delete request ?"
    execute: "Execute"
    noDocsResponses: "No response documentation."
    parsingFailed: "Unable to parse response."
    requestUrl: "Request URL"
    responseBody: "Response Body"
    responseHeaders: "Response Headers"
    responses: Responses
    serverResponse: "Try it out"
    sensitiveOperation: "Sensitive operation"
    status: "Status"
  fr:
    cancel: "Annuler"
    deleteConfirmation: "Êtes-vous sûr de vouloir effectuer cette requête de suppression ?"
    execute: "Exécuter"
    noDocsResponses: "Aucune documentation de réponse."
    parsingFailed: "Impossible de parser la réponse."
    requestUrl: "URL de la requête"
    responseBody: "Corps de la réponse"
    responseHeaders: "En-têtes de la réponse"
    responses: Réponses
    serverResponse: "Essayer"
    sensitiveOperation: "Opération sensible"
    status: "Statut"
</i18n>

<style scoped>
</style>
