<template>
  <v-navigation-drawer permanent>
    <v-list mandatory>
      <!-- Main page -->
      <v-list-item
        title="Informations générales"
        class="font-weight-bold"
      />

      <!-- Paths with no tags -->
      <v-list-item
        v-for="item in categorizedPaths.default"
        :key="item.path"
        :title="item.path"
      >
        <template #append>
          <v-chip density="compact">
            {{ item.method.toUpperCase() }}
          </v-chip>
        </template>
      </v-list-item>

      <!-- All tags -->
      <v-list-group
        v-for="tag in Object.keys(categorizedPaths).filter(t => t != 'default')"
        :key="tag"
      >
        <template #activator="{ props: innerProps }">
          <v-list-item
            v-bind="innerProps"
            :title="tag"
          />
        </template>
        <v-list-item
          v-for="item in categorizedPaths[tag]"
          :key="item.path"
          :title="item.path"
        >
          <template #append>
            <v-chip density="compact">
              {{ item.method.toUpperCase() }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { OpenAPISpecs } from '#api/types'
import { Operation } from '../../../api/types/OpenAPISpecs'

const props = defineProps<{
  paths: OpenAPISpecs['paths']
}>()

const categorizedPaths = computed(() => {
  if (!props.paths) return {}
  const paths = props.paths
  const categorized: Record<string, { path: string, method: string, summary: string }[]> = {}

  for (const path in paths) { // For each route
    const pathItem = paths[path]
    for (const method in pathItem) { // For each method
      if (['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].includes(method)) {
        const tags = (pathItem[method] as Operation).tags || ['default']
        const summary = (pathItem[method] as Operation).summary || ''
        tags.forEach(tag => {
          if (!categorized[tag]) categorized[tag] = []
          categorized[tag].push({ path, method, summary })
        })
      }
    }
  }
  return categorized
})

// TODO v-model contains selected link
</script>

<style scoped>
</style>
