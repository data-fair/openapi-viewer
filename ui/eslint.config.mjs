import neostandard from 'neostandard'
import pluginVue from 'eslint-plugin-vue'
import pluginVuetify from 'eslint-plugin-vuetify'
import dfLibRecommended from '@data-fair/lib-utils/eslint/recommended.js'

export default [
  ...dfLibRecommended,
  ...pluginVue.configs['flat/base'],
  ...pluginVuetify.configs['flat/base'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  },
  ...neostandard({ ts: true }),
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-undef': 'off' // typescript takes care of this with autoImport support
    }
  },
  { ignores: ['dist/*', 'dts/*'] },
]
