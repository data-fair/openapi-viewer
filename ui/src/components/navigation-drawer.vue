<template>
  <v-navigation-drawer permanent>
    <v-list mandatory>
      <!-- Main page -->
      <v-list-item
        :active="!$route.hash"
        @click="$router.push({ hash: '', query: $route.query})"
      >
        <v-list-item-title
          class="text-h6"
        >
          Overview
        </v-list-item-title>
      </v-list-item>

      <!-- Paths with no tags -->
      <v-list-item
        v-for="item in formattedOperations.default"
        :key="item.path"
        :active="$route.hash === `#${item.hash}`"
        @click="$router.push({ hash: `#${item.hash}`, query: $route.query})"
      >
        <template #title>
          <span
            :class="{
              'text-disabled': item.deprecated,
              'font-italic': item.deprecated
            }"
          >
            {{ item.path }}
          </span>
        </template>
        <template #append>
          <v-chip
            density="compact"
            :disabled="item.deprecated"
            :color="colorMethods[item.method]"
          >
            {{ item.method.toUpperCase() }}
          </v-chip>
        </template>
        <v-tooltip
          v-if="item.summary"
          activator="parent"
          :text="item.summary"
        />
      </v-list-item>

      <!-- All tags -->
      <v-list-group
        v-for="tag in orderedTags"
        :key="tag"
      >
        <template #activator="{ props: innerProps }">
          <v-list-item
            v-bind="innerProps"
          >
            <v-list-item-title
              class="text-h6"
            >
              {{ tag }}
              <v-tooltip
                v-if="tags?.find(t => t.name === tag)?.externalDocs"
                location="top"
                :text="tags?.find(t => t.name === tag)?.externalDocs?.description"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    color="primary"
                    density="comfortable"
                    size="small"
                    variant="tonal"
                    target="_blank"
                    rel="noopener noreferrer"
                    :icon="mdiBookOpenVariant"
                    :href="tags.find(t => t.name === tag).externalDocs.url"
                  />
                </template>
              </v-tooltip>
            </v-list-item-title>
            <v-tooltip
              v-if="tags"
              activator="parent"
              :text="tags.find(t => t.name === tag)?.description"
            />
          </v-list-item>
        </template>
        <v-list-item
          v-for="item in formattedOperations[tag]"
          :key="item.path"
          :active="$route.hash === `#${item.hash}`"
          @click="$router.push({ hash: `#${item.hash}`, query: $route.query})"
        >
          <template #title>
            <span
              :class="{
                'text-disabled': item.deprecated,
                'font-italic': item.deprecated
              }"
            >
              {{ item.path }}
            </span>
          </template>
          <template #append>
            <v-chip
              density="compact"
              :disabled="item.deprecated"
              :color="colorMethods[item.method]"
            >
              {{ item.method.toUpperCase() }}
            </v-chip>
          </template>
          <v-tooltip
            v-if="item.summary"
            activator="parent"
            :text="item.summary"
          />
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { OpenAPISpecs, Operation } from '#api/types'

const { paths, tags } = defineProps<{
  paths: OpenAPISpecs['paths']
  tags: OpenAPISpecs['tags']
}>()

const colorMethods: Record<string, string> = {
  delete: 'error',
  get: 'primary',
  patch: 'secondary',
  post: 'success',
  put: 'info',
  options: 'default',
  head: 'default',
  trace: 'default'
}

const formattedOperations = computed(() => {
  if (!paths) return {}
  const categorized: Record<string, {
    path: string,
    method: string,
    summary: string,
    hash: string,
    deprecated?: boolean
  }[]> = {}

  for (const path in paths) { // For each route
    const pathItem = paths[path]
    for (const method in pathItem) { // For each method
      if (['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].includes(method)) {
        const operation = pathItem[method] as Operation & { deprecated: boolean }
        const operationTags = operation.tags && operation.tags.length ? operation.tags : ['default']
        const summary = operation.summary || ''
        operationTags.forEach(tag => {
          if (!categorized[tag]) categorized[tag] = []
          const hash = operation.operationId || `${method}|${path}`
          categorized[tag].push({ path, method, summary, hash, deprecated: operation.deprecated })
        })
      }
    }
  }

  // Sort each category alphabetically by path and place deprecated items at the end
  for (const tag in categorized) {
    categorized[tag].sort((a, b) => {
      if (a.deprecated && !b.deprecated) return 1
      if (!a.deprecated && b.deprecated) return -1
      return a.path.localeCompare(b.path)
    })
  }

  // Add tags without operations
  tags?.forEach(tag => {
    if (!categorized[tag.name]) {
      categorized[tag.name] = []
    }
  })

  return categorized
})

const orderedTags = computed(() => {
  const providedTags = tags?.map(tag => tag.name) || []
  const extraTags = Object.keys(formattedOperations.value)
    .filter(tag => tag !== 'default' && !providedTags.includes(tag))
    .sort()

  return [...providedTags, ...extraTags]
})

</script>

<style scoped>
</style>
