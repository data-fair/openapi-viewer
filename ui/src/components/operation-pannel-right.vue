<template>
  <v-expansion-panels
    v-model="panelRight"
    multiple
  >
    <v-expansion-panel
      value="snippet"
      static
    >
      <template #title>
        <h3>Curl / Url</h3>
      </template>
      <template #text>
        <snippet
          :endpoint-query-values="endpointQueryValues"
          :server-url="serverUrl"
          :method="method"
          :path="fullPath"
        />
      </template>
    </v-expansion-panel>

    <responses
      :responses="operation.responses"
    />

    <v-expansion-panel
      value="serverResponse"
      static
    >
      <template #title>
        <h3>{{ t('serverResponse') }}</h3>
      </template>
      <template #text>
        <template v-if="responseData">
          <h4>
            <v-chip
              :color="getCodeColors(responseData.status)"
              :text="responseData.status"
              density="compact"
              label
            />
            {{ responseData.statusText }}
          </h4>

          <template v-if="responseData.body">
            <h4>{{ t('responseBody') }}</h4>
            <prism
              language="json"
              max-height="400px"
            >
              {{ JSON.stringify(responseData.body, null, 2) }}
            </prism>
          </template>

          <template v-if="responseData.headers">
            <h4>{{ t('responseHeaders') }}</h4>
            <prism
              language="json"
              max-height="400px"
            >
              {{ JSON.stringify(responseData.headers, null, 2) }}
            </prism>
          </template>
        </template>

        <template v-else>
          <p class="text-muted">
            {{ t('noResponses') }}
          </p>
        </template>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import type { GenericEndpointQuery, Operation } from '#api/types'

const { operation, endpointQueryValues, serverUrl, method, path } = defineProps<{
  operation: Operation
  endpointQueryValues: GenericEndpointQuery
  responseData: Record<string, any> | null
  serverUrl: string | null
  method: string
  path: string
}>()

const { t } = useI18n()

const panelRight = ref<string[]>(['snippet', 'serverResponse'])
const fullPath = ref<string>(path)

const getFullPath = () => {
  let fullPath = path
  if (endpointQueryValues.path) {
    for (const [key, value] of Object.entries(endpointQueryValues.path)) {
      fullPath = fullPath.replace(`{${key}}`, encodeURIComponent(value))
    }
  }
  return fullPath
}

watch(() => endpointQueryValues, () => {
  fullPath.value = getFullPath()
}, { immediate: true, deep: true })

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
    noResponses: "No responses received yet."
    responseBody: "Response Body"
    responseHeaders: "Response Headers"
    serverResponse: "Server Response"
  fr:
    noResponses: "Aucune réponse reçue pour le moment."
    responseBody: "Corps de la réponse"
    responseHeaders: "En-têtes de la réponse"
    serverResponse: "Réponse du serveur"
</i18n>

<style scoped>
</style>
