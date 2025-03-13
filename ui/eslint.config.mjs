import neostandard from 'neostandard'
import pluginVue from 'eslint-plugin-vue'
import dfLibRecommended from '@data-fair/lib-utils/eslint/recommended.js'
// cf https://github.com/vuetifyjs/eslint-plugin-vuetify/pull/98
// @ts-ignore
import vuetify from 'eslint-plugin-vuetify/src/index.js'

export default [
  ...dfLibRecommended,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    plugins: { vuetify },
    rules: {
      ...vuetify.configs.base.rules
    }
  },
  ...neostandard({ ts: true }),
  {
    rules: {
      'no-undef': 'off' // typescript takes care of this with autoImport support
    }
  },
  { ignores: ['dist/*', 'dts/*'] },
]
