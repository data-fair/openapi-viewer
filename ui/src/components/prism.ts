// https://github.com/egoist/vue-prism-component/blob/master/src/index.js

import Prism from 'prismjs'
import 'prismjs/themes/prism-okaidia.min.css'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-bash.js'

export default defineComponent({
  props: {
    inline: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'markup'
    }
  },
  setup (props, { slots, attrs }) {
    const slotContent = slots.default?.()[0]?.children

    const code = typeof slotContent === 'string'
      ? slotContent as string
      : ''
    const inline = props.inline
    const language = props.language
    const prismLanguage = Prism.languages[language]
    const className = `language-${language}`

    if (process.env.NODE_ENV === 'development' && !prismLanguage) {
      throw new Error(
        `Prism component for language "${language}" was not found, did you forget to register it? See all available ones: https://cdn.jsdelivr.net/npm/prismjs/components/`
      )
    }

    return () => {
      if (inline) {
        return h('code', {
          class: [className],
          innerHTML: Prism.highlight(code, prismLanguage, language)
        })
      }

      return h(
        'pre',
        {
          ...attrs,
          class: [attrs.class, className]
        },
        [
          h('code', {
            ...attrs,
            class: [attrs.class, className],
            innerHTML: Prism.highlight(code, prismLanguage, language)
          })
        ]
      )
    }
  }
})
