<template>
  <div
    v-if="!inline"
    class="position-relative"
  >
    <v-fab
      class="mt-2 mr-2"
      color="primary"
      size="small"
      text="Copy"
      location="top right"
      absolute
      extended
      :prepend-icon="mdiContentCopy"
      @click="copyToClipboard"
    />
    <pre :class="className"><code
      :class="className"
      v-html="highlightedCode"
    /></pre>
  </div>
  <code
    v-else
    :class="className"
    v-html="highlightedCode"
  />
</template>

<script setup lang="ts">
import Prism from 'prismjs'
import 'prismjs/themes/prism-okaidia.min.css'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-bash.js'

const { sendUiNotif } = useUiNotif()

const props = defineProps<{
  inline?: boolean
  language?: string
}>()

const slots = defineSlots()
const slotContent = computed(() => slots.default?.()?.[0]?.children ?? '')

const className = computed(() => `language-${props.language ?? 'markup'}`)

const highlightedCode = computed(() => {
  const code = typeof slotContent.value === 'string' ? slotContent.value : ''
  const prismLanguage = Prism.languages[props.language ?? 'markup']

  if (import.meta.env.MODE === 'development' && !prismLanguage) {
    console.warn(
      `Prism component for language "${props.language}" was not found. Did you forget to register it?`
    )
    return code
  }

  return Prism.highlight(code, prismLanguage, props.language ?? 'markup')
})

const copyToClipboard = async () => {
  await navigator.clipboard.writeText(slotContent.value as string).then(() => {
    sendUiNotif({ type: 'success', msg: 'Copied to clipboard !' })
  }).catch(error => {
    sendUiNotif({ type: 'error', msg: 'Failed to copy', error })
  })
}

</script>

<style scoped>
</style>
