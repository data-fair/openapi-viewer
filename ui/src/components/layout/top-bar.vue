<template>
  <v-app-bar
    title="OpenAPI 3 Viewer"
    :elevation="2"
  >
    <v-text-field
      v-model="search"
      density="compact"
      hide-details="auto"
      variant="solo-filled"
      clearable
      :label="t('docUrl')"
      :prepend-inner-icon="mdiCodeJson"
    />
    <v-spacer />
    <v-select
      v-model="selectedExample"
      class="mr-4"
      density="compact"
      hide-details="auto"
      item-value="file"
      max-width="200"
      variant="solo-filled"
      clearable
      :label="t('examples')"
      :items="examples"
      @update:model-value="changeUrl"
    />
  </v-app-bar>
</template>

<script setup lang="ts">
import examples from '~/assets/examples.json'

const { t } = useI18n()
const search = useStringSearchParam('url')
const selectedExample = ref<string | null>(null)

function changeUrl () {
  if (selectedExample.value) {
    search.value = `${window.location.origin}${window.location.pathname}examples/${selectedExample.value}`
  }
}

</script>

<i18n lang="yaml">
  en:
    docUrl: "OpenAPI Doc Location"
    examples: "Examples"
  fr:
    docUrl: "Localisation de la documentation OpenAPI"
    examples: "Exemples"
</i18n>

<style scoped>
</style>
