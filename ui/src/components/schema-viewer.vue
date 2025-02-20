<template>
  <!-- <v-tabs
    v-model="tab"
  >
    <v-tab value="Raw">
      Raw
    </v-tab>
    <v-tab value="Tree">
      Tree
    </v-tab>
  </v-tabs>
  <v-tabs-window
    v-model="tab"
  >
    <v-tabs-window-item value="Tree">
      // TODO later
    </v-tabs-window-item>
    <v-tabs-window-item value="Raw"> -->
  <prism
    language="json"
    style="max-height: 800px;"
  >
    {{ JSON.stringify(jsonSchema, null, 2) }}
  </prism>
  <!-- </v-tabs-window-item>
  </v-tabs-window> -->
</template>

<script setup lang="ts">

const { jsonSchema } = defineProps<{ jsonSchema: any }>()
// const tab = ref('Raw')
</script>

<style scoped>
</style>
