import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'vue-router/vite'
import { VueRouterAutoImports } from 'vue-router/unplugin'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Vuetify from 'vite-plugin-vuetify'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import microTemplate from '@data-fair/lib-utils/micro-template.js'
import { autoImports, settingsPath } from '@data-fair/lib-vuetify/vite.js'
import { commonjsDeps } from '@koumoul/vjsf/utils/build.js'

// dev ports come from .env (declared in dev/dev.json), checked so a missing variable never becomes NaN
const envPort = (name: string) => {
  const port = Number(process.env[name])
  if (!Number.isInteger(port) || port <= 0) throw new Error(`${name} must be set to a port number, run "npx --no df-dev setup"`)
  return port
}

// https://vitejs.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  base: '/openapi-viewer',
  optimizeDeps: {
    // no discovery: a dependency found while browsing reloads the page, which breaks cold e2e runs;
    // ESM dependencies are served as is, only the commonjs ones must be listed here, with the
    // exact import specifier
    noDiscovery: true,
    include: [
      'debug',
      ...commonjsDeps,
      'prismjs',
      'prismjs/components/prism-bash.min.js',
      'prismjs/components/prism-json.min.js',
      'prismjs/components/prism-yaml.min.js',
      'statuses'
    ]
  },
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, 'src/')
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
      exclude: command === 'build' ? ['src/pages/dev.vue', 'src/pages/dev-embed.vue'] : []
    }),
    Vue({ template: { compilerOptions: { isCustomElement: (tag) => ['d-frame'].includes(tag) } } }),
    VueI18nPlugin(),
    Vuetify({ styles: { configFile: settingsPath } }),
    AutoImport({
      dts: './dts/auto-imports.d.ts',
      vueTemplate: true,
      imports: [
        ...(autoImports as any),
        VueRouterAutoImports,
        {
          '~/context': ['$uiConfig', '$sitePath', '$fetch'],
          '@mdi/js': [
            'mdiAlertCircle',
            'mdiAsterisk',
            'mdiBookOpenVariant',
            'mdiCodeJson',
            'mdiContentCopy',
            'mdiEmail',
            'mdiFileTree',
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
        const { uiConfig, siteResourcesHtml } = await import('../api/src/config.ts')
        return microTemplate(html, { SITE_RESOURCES: siteResourcesHtml, SITE_PATH: '', UI_CONFIG: JSON.stringify(uiConfig), THEME_CSS_HASH: '', PUBLIC_SITE_INFO_HASH: '' })
      }
    }
  ],
  experimental: {
    renderBuiltUrl (filename, { hostType }) {
      if (hostType === 'html') return '{SITE_PATH}/openapi-viewer/' + filename
      return { relative: true }
    }
  },
  // vite preview also runs as serve and must not require the dev ports
  ...(command === 'serve' && !isPreview
    ? { server: { port: envPort('DEV_UI_PORT'), strictPort: true, hmr: { port: envPort('DEV_UI_HMR_PORT') } } }
    : {})
}))
