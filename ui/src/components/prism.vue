<template>
  <div
    v-if="!inline"
    class="position-relative text-body-2"
  >
    <v-tooltip
      v-if="copy && /<([a-zA-Z]+)([^>]*)>(.*?)<\/\1>/.test(highlightedCode)"
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
    <pre
      ref="preElement"
      :class="className"
      :style="style"
    ><code
      v-safe-html="highlightedCode"
      :class="className"
    /></pre>
  </div>
  <code
    v-else
    v-safe-html="highlightedCode"
    :class="className"
  />
</template>

<script setup lang="ts">
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.min.css'
import 'prismjs/components/prism-json.min.js'
import 'prismjs/components/prism-bash.min.js'
import 'prismjs/components/prism-yaml.min.js'

const { t } = useI18n()
const { sendUiNotif } = useUiNotif()

const { inline, language, maxHeight, copy } = defineProps<{
  inline?: boolean
  language?: string
  maxHeight?: string
  copy?: boolean
}>()

const slots = defineSlots()
const slotContent = computed(() => slots.default?.()?.[0]?.children ?? '')

const className = computed(() => `language-${language ?? 'markup'} rounded`)
const style = computed(() => 'max-height: ' + (maxHeight ?? 'none'))

const highlightedCode = computed(() => {
  const code = typeof slotContent.value === 'string' ? slotContent.value : ''
  const prismLanguage = Prism.languages[language ?? 'markup']

  if (!prismLanguage) {
    console.warn(
      `Prism component for language "${language}" was not found. Did you forget to register it?`
    )
    return code
  }

  return Prism.highlight(code, prismLanguage, language ?? 'markup')
})

async function copyToClipboard () {
  await navigator.clipboard.writeText(slotContent.value as string).then(() => {
    sendUiNotif({ type: 'success', msg: 'Copied to clipboard !' })
  }).catch(error => {
    sendUiNotif({ type: 'error', msg: 'Failed to copy', error })
  })
}

</script>

<i18n lang="yaml">
  en:
    copy: "Copy"
  fr:
    copy: "Copier"
</i18n>

<style scoped>
</style>
