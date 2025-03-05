<template>
  <v-navigation-drawer permanent>
    <v-list
      data-iframe-height
      mandatory
    >
      <!-- Main page -->
      <v-list-item
        :active="!$route.query.operation"
        @click="$router.push({ query: { ...$route.query, operation: undefined }})"
      >
        <v-list-item-title
          class="text-h6"
        >
          {{ t('overview') }}
        </v-list-item-title>
      </v-list-item>

      <!-- Paths without tags -->
      <navigation-drawer-items
        tag="default"
        :formatted-operations="formattedOperations"
      />

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
              <!-- External docs -->
              <v-tooltip
                v-if="tagsMap[tag]?.externalDocs"
                location="top"
                :text="tagsMap[tag].externalDocs?.description"
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
                    :href="tagsMap[tag].externalDocs?.url"
                    :icon="mdiBookOpenVariant"
                  />
                </template>
              </v-tooltip>
              {{ tag }}
              <v-tooltip
                v-if="tagsMap[tag]?.description"
                activator="parent"
                close-delay="250"
                open-delay="500"
                :text="tagsMap[tag].description"
              />
            </v-list-item-title>
          </v-list-item>
        </template>
        <navigation-drawer-items
          :formatted-operations="formattedOperations"
          :tag="tag"
        />
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { OpenAPISpecs, Operation, Tag } from '#api/types'

const { paths, tags } = defineProps<{
  paths: OpenAPISpecs['paths'] | undefined,
  tags: OpenAPISpecs['tags'] | undefined
}>()

const { t } = useI18n()

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
          const hash = operation.operationId || `${path}|${method}`
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

const tagsMap = computed(() => {
  const map: Record<string, Tag> = {}
  tags?.forEach(tag => {
    map[tag.name] = tag
  })
  return map
})

</script>

<i18n lang="yaml">
  en:
    overview: "Overview"
  fr:
    overview: "Vue d'ensemble"
</i18n>

<style scoped>
</style>
