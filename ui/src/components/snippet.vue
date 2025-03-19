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

const { endpointQueryValues, method, fullPath } = defineProps<{
  endpointQueryValues: GenericEndpointQuery
  method: string
  fullPath: string
}>()

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

<style scoped>
</style>
