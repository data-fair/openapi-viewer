import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { vuetifySessionOptions } from '@data-fair/lib-vuetify'
import './vuetify-settings.scss'
import { createReactiveSearchParams } from '@data-fair/lib-vue/reactive-search-params.js'
import { createLocaleDayjs } from '@data-fair/lib-vue/locale-dayjs.js'
import { createSession } from '@data-fair/lib-vue/session.js'
import { createUiNotif } from '@data-fair/lib-vue/ui-notif.js'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
// TODO: remove v-iframe and iframe-resizer when d-frame is fully integrated
import '@koumoul/v-iframe/content-window'
import 'iframe-resizer/js/iframeResizer.contentWindow.js'
import dFrameContent from '@data-fair/frame/lib/vue-router/d-frame-content.js'

(window as any).iFrameResizer = { heightCalculationMethod: 'taggedElement' };

(async function () {
  const router = createRouter({ history: createWebHistory($sitePath + '/openapi-viewer/'), routes })
  dFrameContent(router)
  const reactiveSearchParams = createReactiveSearchParams(router)
  const uiNotif = createUiNotif()
  const vuetifyOptions = {
    defaults: {},
    icons: { defaultSet: 'mdi', aliases, sets: { mdi } }
  }

  let session, localeDayjs, i18n
  if ($uiConfig.useSimpleDirectory) { // Don't integrate session in standalone mode
    session = await createSession({ directoryUrl: $sitePath + '/simple-directory', siteInfo: true })
    localeDayjs = createLocaleDayjs(session.state.lang)
    i18n = createI18n({ locale: session.state.lang })
    Object.assign(vuetifyOptions, vuetifySessionOptions(session))
  } else {
    i18n = createI18n({ locale: 'en' })
  }

  // TODO: remove when d-frame is fully integrated
  (window as any).vIframeOptions = { router }

  const vuetify = createVuetify(vuetifyOptions)
  const app = createApp(App)
    .use(router)
    .use(reactiveSearchParams)
    .use(uiNotif)
    .use(vuetify)
    .use(i18n)

  if ($uiConfig.useSimpleDirectory) {
    app.use(session!)
      .use(localeDayjs!)
  }

  app.mount('#app')
})()
