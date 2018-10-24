import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import VueResource from 'vue-resource'

import App from './App.vue'

import 'iframe-resizer/js/iframeResizer.contentWindow'

Vue.use(VueMaterial)
Vue.use(VueResource)

Vue.material.registerTheme('default', {
  primary: 'black',
  accent: {
    color: 'deep-orange',
    hue: '600'
  },
  warn: {
    color: 'orange',
    hue: '400'
  }
})

/* eslint-disable no-new */
new Vue({
  template: '<App />',
  components: {
    App
  }
}).$mount('#app')
