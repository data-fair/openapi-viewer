<template>
  <prism
    :key="snippet || 'loading'"
    language="bash"
    max-height="400px"
  >
    {{ snippet }}
  </prism>
</template>

<script setup lang="ts">
import type { GenericEndpointQuery } from '#api/types'

const { endpointQueryValues, serverUrl, method, path } = defineProps<{
  endpointQueryValues: GenericEndpointQuery
  serverUrl: string | null
  method: string
  path: string
}>()

const snippet = ref('')

const generateSnippet = () => {
  const curlCommand = [`curl -X ${method.toUpperCase()}`]

  // Construire l'URL complète
  let url = `${serverUrl || ''}${path}`
  if (endpointQueryValues.query && Object.keys(endpointQueryValues.query).length > 0) {
    const queryParams = new URLSearchParams(endpointQueryValues.query).toString()
    url += `?${queryParams}`
  }
  curlCommand.push(`"${url}"`)

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
      curlCommand.push(`-d '${JSON.stringify(endpointQueryValues.body)}'`)
    }
  }

  snippet.value = curlCommand.join(' \\\n  ')
}

watch(() => endpointQueryValues, generateSnippet, { deep: true, immediate: true })
</script>

<style scoped>
</style>
