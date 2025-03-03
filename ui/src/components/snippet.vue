<template>
  <h4>{{ t('curlCommand') }}</h4>
  <prism
    :key="snippet || 'loading'"
    language="bash"
    max-height="400px"
  >
    {{ snippet }}
  </prism>
  <h4>{{ t('urlRequest') }}</h4>
  <pre
    style="white-space: pre-wrap; word-break: break-all;"
    class="text-body-2"
  ><code>{{ url }}</code></pre>
</template>

<script setup lang="ts">
import type { GenericEndpointQuery } from '#api/types'

const { endpointQueryValues, serverUrl, method, path } = defineProps<{
  endpointQueryValues: GenericEndpointQuery
  serverUrl: string | null
  method: string
  path: string
}>()

const { t } = useI18n()

const snippet = ref('')
const url = ref('')

function generateSnippet () {
  const curlCommand = [`curl -X ${method.toUpperCase()}`]

  // Construire l'URL complète
  url.value = `${serverUrl || ''}${path}`
  if (endpointQueryValues.query && Object.keys(endpointQueryValues.query).length > 0) {
    const queryParams = new URLSearchParams(endpointQueryValues.query).toString()
    url.value += `?${queryParams}`
  }
  curlCommand.push(`"${url.value}"`)

  // Ajouter les headers
  if (endpointQueryValues.header) {
    for (const [key, value] of Object.entries(endpointQueryValues.header)) {
      curlCommand.push(`-H "${key}: ${value}"`)
    }
  }

  // Ajouter le body si nécessaire
  if (endpointQueryValues.body && Object.keys(endpointQueryValues.body).length > 0) {
    const contentType = endpointQueryValues.body?.contentType || 'application/json'
    curlCommand.push(`-H "Content-Type: ${contentType}"`)

    if (contentType === 'multipart/form-data') {
      const params = []
      for (const [key, value] of Object.entries(endpointQueryValues.body)) {
        if (key === 'contentType') continue
        if (value instanceof File) {
          params.push(`-F "${key}=@${value.name}"`)
        } else {
          params.push(`-F "${key}=${value}"`)
        }
      }
      curlCommand.push(...params)
    } else {
      curlCommand.push(`-d '${endpointQueryValues.body.value || ''}'`)
    }
  }

  snippet.value = curlCommand.join(' \\\n  ')
}

watch(() => endpointQueryValues, generateSnippet, { deep: true, immediate: true })
</script>

<i18n lang="yaml">
  en:
    curlCommand: 'Curl command'
    urlRequest: 'URL request'
  fr:
    curlCommand: 'Commande curl'
    urlRequest: 'Url de la requête'
</i18n>

<style scoped>
</style>
