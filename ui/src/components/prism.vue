<template>
  <div
    v-if="!inline"
    class="position-relative text-body-medium"
  >
    <v-tooltip
      v-if="copy && code"
      :text="t('copy')"
      location="top right"
      open-delay="500"
    >
      <template #activator="{ props }">
        <v-fab
          v-bind="props"
          class="mt-2 mr-6"
          color="primary"
          density="default"
          location="top right"
          size="x-small"
          absolute
          :icon="mdiContentCopy"
          @click="copyToClipboard"
        />
      </template>
    </v-tooltip>
    <!-- Prism escapes the code it highlights: its output needs no sanitizing -->
    <!-- eslint-disable vue/no-v-html -->
    <pre
      :class="className"
      :style="style"
    ><code
      v-if="highlightedCode !== null"
      :class="className"
      v-html="highlightedCode"
    /><code
      v-else
      :class="className"
    >{{ code }}</code></pre>
  </div>
  <code
    v-else-if="highlightedCode !== null"
    :class="className"
    v-html="highlightedCode"
  />
  <code
    v-else
    :class="className"
  >{{ code }}</code>
  <!-- eslint-enable vue/no-v-html -->
</template>

<script setup lang="ts">
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.min.css'
import 'prismjs/components/prism-json.min.js'
import 'prismjs/components/prism-bash.min.js'
import 'prismjs/components/prism-yaml.min.js'

const { t } = useI18n()
const { sendUiNotif } = useUiNotif()

const { inline, language = 'markup', maxHeight = 'none', copy } = defineProps<{
  inline?: boolean
  language?: string
  maxHeight?: string
  copy?: boolean
}>()

const slots = defineSlots()
const slotContent = computed(() => slots.default?.()?.[0]?.children ?? '')

const className = computed(() => `language-${language} rounded`)
const style = computed(() => 'max-height: ' + maxHeight)

const code = computed(() => typeof slotContent.value === 'string' ? slotContent.value : '')

// past this size, highlighting a response body freezes the page (DOM of hundreds of thousands
// of tokens): the code is shown as plain text
const maxHighlightedLength = 100_000

// null: show the code as plain text
const highlightedCode = computed(() => {
  const prismLanguage = Prism.languages[language]
  if (!prismLanguage) {
    console.warn(`Prism component for language "${language}" was not found. Did you forget to register it?`)
    return null
  }
  if (code.value.length > maxHighlightedLength) return null
  return Prism.highlight(code.value, prismLanguage, language)
})

async function copyToClipboard () {
  await navigator.clipboard.writeText(code.value).then(() => {
    sendUiNotif({ type: 'success', msg: t('copied') })
  }).catch(error => {
    sendUiNotif({ type: 'error', msg: t('copyFailed'), error })
  })
}

</script>

<i18n lang="yaml">
  en:
    copy: "Copy"
    copied: "Copied to clipboard"
    copyFailed: "Failed to copy"
  fr:
    copy: "Copier"
    copied: "Copié dans le presse-papier"
    copyFailed: "Échec de la copie"
</i18n>

<style scoped>
</style>
