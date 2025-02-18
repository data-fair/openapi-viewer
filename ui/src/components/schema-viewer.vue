<template>
  <v-tabs
    v-model="tab"
  >
    <v-tab value="Tree">
      Tree
    </v-tab>
    <v-tab value="Raw">
      Raw
    </v-tab>
  </v-tabs>
  <v-tabs-window
    v-model="tab"
  >
    <v-tabs-window-item value="Tree">
      // TODO later
    </v-tabs-window-item>
    <v-tabs-window-item value="Raw">
      <prism language="json">
        {{ JSON.stringify(jsonSchema, null, 2) }}
      </prism>
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup lang="ts">
import prism from '~/components/prism.ts'

const { jsonSchema } = defineProps<{ jsonSchema: any }>()
const tab = ref('Tree')
</script>

<style scoped>
</style>
