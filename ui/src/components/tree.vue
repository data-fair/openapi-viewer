<template>
  <v-treeview
    density="compact"
    :items="treeItems"
  >
    <template #title="{ item }">
      <p>
        {{ item.title }}
        <span class="text-caption text-primary">{{ item.itemType }}</span>
        <v-icon
          v-if="item.itemRequired"
          color="error"
          size="x-small"
          :icon="mdiAsterisk"
        />
        <v-chip
          v-if="item.itemFormat"
          class="ml-2 text-caption"
          density="compact"
          label
        >
          {{ item.itemFormat }}
        </v-chip>
      </p>
    </template>
  </v-treeview>
</template>

<script setup lang="ts">
import { VTreeview } from 'vuetify/labs/VTreeview'

const { jsonSchema } = defineProps<{
  jsonSchema: any
}>()

let idCounter = 0
function getNextId () {
  return ++idCounter
}

function buildTreeItems (schema: any, key?: string, isRequired?: boolean) {
  const node = {
    id: getNextId(),
    title: schema.title || key || '',
    itemType: schema.type ? schema.type : undefined,
    itemFormat: schema.format ? schema.format : undefined,
    itemRequired: Boolean(isRequired),
    children: [] as any[]
  }

  // Add description as first child if exists
  if (schema.description) {
    node.children.push({ id: getNextId(), title: schema.description })
  }

  // Append enum items if they exist
  if (schema.enum) {
    node.children.push({
      id: getNextId(),
      title: 'Enum',
      children: schema.enum.map((val: any) => ({ id: getNextId(), title: String(val) }))
    })
  }

  // Append oneOf items if they exist
  if (schema.oneOf) {
    node.children.push({
      id: getNextId(),
      title: 'One of',
      children: schema.oneOf.map((sub: any) => buildTreeItems(sub))
    })
  }

  // Append allOf items if they exist
  if (schema.allOf) {
    node.children.push({
      id: getNextId(),
      title: 'All of',
      children: schema.allOf.map((sub: any) => buildTreeItems(sub))
    })
  }

  // Recursively process properties
  if (schema.properties) {
    for (const prop in schema.properties) {
      const subSchema = schema.properties[prop]
      const required = Array.isArray(schema.required) && schema.required.includes(prop)
      node.children.push(buildTreeItems(subSchema, prop, required))
    }
  }

  return node
}

const treeItems = computed(() => {
  return [buildTreeItems(jsonSchema)]
})

</script>

<style scoped>
</style>
