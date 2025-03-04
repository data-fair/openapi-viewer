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
      value="raw"
      size="small"
      :prepend-icon="mdiCodeJson"
      :text="t('raw')"
    />
    <v-btn
      value="tree"
      size="small"
      :prepend-icon="mdiFileTree"
      :text="t('tree')"
    />
  </v-btn-toggle>
  <v-tabs-window
    v-model="tab"
  >
    <v-tabs-window-item value="raw">
      <prism
        language="json"
        max-height="800px"
      >
        {{ JSON.stringify(jsonSchema, null, 2) }}
      </prism>
    </v-tabs-window-item>
    <v-tabs-window-item value="tree">
      <tree :json-schema="jsonSchema" />
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup lang="ts">
const { jsonSchema } = defineProps<{ jsonSchema: any }>()
const { t } = useI18n()
const tab = ref('raw')
</script>

<i18n lang="yaml">
  en:
    raw: Raw
    tree: Tree
  fr:
    raw: Brut
    tree: Arbre
</i18n>

<style scoped>
</style>
