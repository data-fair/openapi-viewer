<template>
  <span class="text-h6">{{ t('curlCommand') }}</span>
  <prism
    :key="snippet || 'loading'"
    language="bash"
    max-height="400px"
  >
    {{ snippet }}
  </prism>
  <span class="text-h6">{{ t('urlRequest') }}</span>
  <pre
    style="white-space: pre-wrap; word-break: break-all;"
    class="text-body-2"
  ><code>{{ fullPath }}</code></pre>
</template>

<script setup lang="ts">
import type { GenericEndpointQuery } from '#api/types'

const { endpointQueryValues, method, fullPath } = defineProps<{
  endpointQueryValues: GenericEndpointQuery
  method: string
  fullPath: string
}>()

const { t } = useI18n()

const snippet = computed(() => {
  const curlCommand = [
    `curl -X ${method.toUpperCase()}`,
    `"${fullPath}"`
  ]

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
        if (key === 'contentType' || value === undefined) continue
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

  return curlCommand.join(' \\\n  ')
})

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
