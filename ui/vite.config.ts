import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Vuetify from 'vite-plugin-vuetify'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import microTemplate from '@data-fair/lib-utils/micro-template.js'
import { autoImports } from '@data-fair/lib-vuetify/vite.js'
import { commonjsDeps } from '@koumoul/vjsf/utils/build.js'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/openapi-viewer',
  build: {
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 2000
      }
    }
  },
  optimizeDeps: { include: ['debug', ...commonjsDeps] },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src/')
    },
  },
  plugins: [
    nodePolyfills({
      include: ['path'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
    VueRouter({
      dts: './dts/typed-router.d.ts',
    }),
    Vue({ template: { compilerOptions: { isCustomElement: (tag) => ['d-frame'].includes(tag) } } }),
    VueI18nPlugin(),
    Vuetify(),
    AutoImport({
      dts: './dts/auto-imports.d.ts',
      vueTemplate: true,
      imports: [
        ...(autoImports as any),
        {
          '~/context': ['$uiConfig', '$sitePath', '$fetch'],
          '@mdi/js': [
            'mdiAlertCircle',
            'mdiAsterisk',
            'mdiBookOpenVariant',
            'mdiCodeJson',
            'mdiContentCopy',
            'mdiEmail',
            'mdiGavel',
            'mdiHome',
            'mdiLabel',
            'mdiPlay',
            'mdiSecurity'
          ]
        }
      ],
      dirs: [
        'src/utils'
      ]
    }),
    Components({ dts: './dts/components.d.ts' }),
    {
      name: 'inject-site-context',
      async transformIndexHtml (html) {
        // in production this injection will be performed by an express middleware
        if (process.env.NODE_ENV !== 'development') return html
        const { uiConfig } = await import('../api/src/config.ts')
        return microTemplate(html, { SITE_PATH: '', UI_CONFIG: JSON.stringify(uiConfig) })
      }
    }
  ],
  experimental: {
    renderBuiltUrl (filename, { hostType }) {
      if (hostType === 'html') return '{SITE_PATH}/openapi-viewer/' + filename
      return { relative: true }
    }
  },
  server: { hmr: { port: 7200 } }
})
