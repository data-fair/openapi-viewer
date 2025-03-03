<template>
  <v-treeview
    density="compact"
    style="background-color:transparent"
    :items="treeItems"
    open-on-click
  >
    <template #title="{ item }">
      <p class="text-wrap">
        <span :class="{'text-decoration-line-through font-italic text-gray': item.itemDeprecated}">{{ item.title }}</span>&nbsp;
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
          size="small"
          label
          :text="item.itemFormat"
        />
        <v-chip
          v-if="item.itemDeprecated"
          class="ml-2 text-caption text-warning"
          density="compact"
          size="small"
          :text="t('deprecated')"
          :prepend-icon="mdiAlertCircle"
        />
      </p>
    </template>
  </v-treeview>
</template>

<script setup lang="ts">
import { VTreeview } from 'vuetify/labs/VTreeview'

const { jsonSchema } = defineProps<{
  jsonSchema: any
}>()

const { t } = useI18n()

function buildTreeItems (schema: any, key?: string, isRequired?: boolean) {
  const node = {
    title: schema.title || key || '',
    itemType: schema.type ? schema.type : undefined,
    itemFormat: schema.format ? schema.format : undefined,
    itemRequired: Boolean(isRequired),
    itemDeprecated: schema.deprecated,
    children: [] as any[] | undefined
  }

  // Add description as first child if exists
  if (schema.description) {
    node.children!.push({ title: schema.description })
  }

  // Append enum items if they exist
  if (schema.enum) {
    node.children!.push({
      title: 'Enum',
      children: schema.enum.map((val: any, i: number) => ({ title: `#${i}="${val}"` }))
    })
  }

  // Append oneOf items if they exist
  if (schema.oneOf) {
    node.children!.push({
      title: 'One of',
      children: schema.oneOf.map((sub: any) => buildTreeItems(sub))
    })
  }

  // Append allOf items if they exist
  if (schema.allOf) {
    node.children!.push({
      title: 'All of',
      children: schema.allOf.map((sub: any) => buildTreeItems(sub))
    })
  }

  // Recursively process properties
  if (schema.properties) {
    for (const prop in schema.properties) {
      const subSchema = schema.properties[prop]
      const required = Array.isArray(schema.required) && schema.required.includes(prop)
      node.children!.push(buildTreeItems(subSchema, prop, required))
    }
  }

  if (node.children!.length === 0) {
    delete node.children
  }

  return node
}

const treeItems = computed(() => {
  return [buildTreeItems(jsonSchema)]
})

</script>

<i18n lang="yaml">
  en:
    deprecated: "Deprecated"
  fr:
    deprecated: "Déprécié"
</i18n>

<style scoped>
</style>
