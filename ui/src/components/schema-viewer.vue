<template>
  <v-btn-toggle
    v-model="tab"
    color="primary"
    density="compact"
    variant="outlined"
    rounded="pill"
    mandatory
    style="height: 25px"
  >
    <v-btn
      value="json"
      size="small"
      :prepend-icon="mdiCodeJson"
    >
      JSON
    </v-btn>
    <v-btn
      value="yaml"
      size="small"
      :prepend-icon="mdiFileTree"
    >
      YAML
    </v-btn>
  </v-btn-toggle>
  <v-tabs-window
    v-model="tab"
  >
    <v-tabs-window-item value="json">
      <prism
        language="json"
        max-height="800px"
        copy
      >
        {{ JSON.stringify(jsonSchema, null, 2) }}
      </prism>
    </v-tabs-window-item>
    <v-tabs-window-item value="yaml">
      <prism
        language="yaml"
        max-height="800px"
        copy
      >
        {{ YAML.stringify(jsonSchema) }}
      </prism>
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup lang="ts">
import YAML from 'yaml'

const { jsonSchema } = defineProps<{ jsonSchema: any }>()
const tab = ref('json')
</script>

<style scoped>
</style>
