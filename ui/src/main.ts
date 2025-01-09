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
  const session = await createSession({ directoryUrl: $sitePath + '/simple-directory', siteInfo: true })
  const localeDayjs = createLocaleDayjs(session.state.lang)
  const uiNotif = createUiNotif()
  const vuetifyOptions = {
    defaults: {},
    ...vuetifySessionOptions(session),
    icons: { defaultSet: 'mdi', aliases, sets: { mdi } }
  }
  const vuetify = createVuetify(vuetifyOptions)
  const i18n = createI18n({ locale: session.state.lang });

  // TODO: remove when d-frame is fully integrated
  (window as any).vIframeOptions = { router }

  createApp(App)
    .use(router)
    .use(reactiveSearchParams)
    .use(session)
    .use(localeDayjs)
    .use(uiNotif)
    .use(vuetify)
    .use(i18n)
    .mount('#app')
})()
