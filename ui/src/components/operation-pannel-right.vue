<template>
  <v-tabs
    v-model="panelRight"
    grow
  >
    <v-tab value="snippet">
      Curl / Url
    </v-tab>
    <v-tab value="responses">
      {{ t('responses') }}
    </v-tab>
    <v-tab value="serverResponse">
      {{ t('serverResponse') }}
    </v-tab>
  </v-tabs>

  <v-tabs-window v-model="panelRight">
    <v-tabs-window-item
      value="snippet"
      class="mt-2"
    >
      <snippet
        :endpoint-query-values="endpointQueryValues"
        :server-url="serverUrl"
        :method="method"
        :path="fullPath"
      />
    </v-tabs-window-item>

    <v-tabs-window-item value="responses">
      <responses
        v-if="operation.responses"
        :responses="operation.responses"
      />
    </v-tabs-window-item>

    <v-tabs-window-item value="serverResponse">
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
          <span
            v-if="!responseData.type"
            class="font-italic"
          >
            {{ t('parsingFailed') }}
          </span>
          <schema-viewer
            v-else-if="responseData.type === 'json'"
            :json-schema="responseData.body"
          />
          <template v-else-if="responseData.type === 'image'">
            <v-img
              :src="responseData.body"
              alt="Response Image"
            />
          </template>
          <prism
            v-else
            max-height="500px"
          >
            {{ responseData.body }}
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
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup lang="ts">
import type { GenericEndpointQuery, Operation } from '#api/types'

const { operation, endpointQueryValues, responseData, serverUrl, method, path } = defineProps<{
  operation: Operation
  endpointQueryValues: GenericEndpointQuery
  responseData: Record<string, any> | null
  serverUrl: string | null
  method: string
  path: string
}>()

const { t } = useI18n()

const panelRight = ref<string>('snippet')
const fullPath = ref<string>(path)

function getFullPath () {
  let fullPath = path
  if (endpointQueryValues.path) {
    for (const [key, value] of Object.entries(endpointQueryValues.path)) {
      fullPath = fullPath.replace(`{${key}}`, encodeURIComponent(value))
    }
  }
  return fullPath
}

function setActiveTab (tab: string) {
  panelRight.value = tab
}

defineExpose({ setActiveTab })
onMounted(() => {
  if (panelRight.value === 'serverResponse') panelRight.value = 'snippet'
})

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
    parsingFailed: "Unable to parse response"
    responseBody: "Response Body"
    responseHeaders: "Response Headers"
    responses: Responses
    serverResponse: "Server Response"
  fr:
    noResponses: "Aucune réponse reçue pour le moment."
    parsingFailed: "Impossible de parser la réponse"
    responseBody: "Corps de la réponse"
    responseHeaders: "En-têtes de la réponse"
    responses: Réponses
    serverResponse: "Réponse du serveur"
</i18n>

<style scoped>
</style>
