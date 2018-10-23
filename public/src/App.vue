<template>
<div>
  <md-toolbar v-if="showToolbar">
    <md-layout md-row md-align="center">
      <md-layout md-flex="50" md-flex-offset="25">
        <md-input-container>
          <label>OpenAPI JSON location</label>
          <md-input v-model="url" @keyup.enter.native="refresh"></md-input>
        </md-input-container>
      </md-layout>
      <md-layout>
        <md-button @click.native="refresh">
          <md-icon>autorenew</md-icon>
        </md-button>
        <md-checkbox v-model="useProxy" title="Allows to bypass CORS restrictions">Use proxy</md-checkbox>
      </md-layout>
    </md-layout>
  </md-toolbar>
  <open-api v-if="api && !error" :api="api" :headers="headers" :query-params="queryParams"></open-api>
  <md-layout md-row md-align="center" v-if="error" style="margin-top:64px">
    <md-layout md-flex="50" md-flex-offset="25">
      <md-whiteframe md-elevation="2" style="padding:24px">Cannot retrieve data for this URL or JSON is not well formed</md-whiteframe>
    </md-layout>
  </md-layout>
</div>
</template>

<script>
import OpenApi from '@koumoul/vue-openapi'
import yaml from 'js-yaml'

// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href
  }
  name = name.replace(/[\[\]]/g, '\\$&')
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  let results = regex.exec(url)
  if (!results) {
    return null
  }
  if (!results[2]) {
    return ''
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

// https://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  } else {
    return uri + separator + key + "=" + value;
  }
}

export default {
  name: 'app',
  components: {
    OpenApi
  },
  data: () => ({
    api: null,
    error: null,
    useProxy: getParameterByName('proxy') === 'true' || false,
    url: getParameterByName('url') || 'https://koumoul.com/s/geocoder/api/v1/api-docs.json',
    headers: (getParameterByName('headers') && JSON.parse(decodeURIComponent(getParameterByName('headers')))) || {},
    queryParams : (getParameterByName('query-params') && JSON.parse(decodeURIComponent(getParameterByName('query-params')))) || {},
    showToolbar: !(getParameterByName('hide-toolbar') === 'true')
  }),
  mounted() {
    this.refresh()
  },
  methods: {
    refresh() {
      let newUrl = updateQueryStringParameter(window.location.href, 'url', this.url)
      newUrl = updateQueryStringParameter(newUrl, 'proxy', this.useProxy)
      if (newUrl !== window.location.href) {
        window.location.href = newUrl
      }
      this.$http.get(this.useProxy ? ('./proxy?url=' + this.url) : this.url).then(response => {
        try {
          return yaml.safeLoad(response.bodyText, 'utf8');
        } catch (e) {
          return response.json()
        }
      }).then(api => {
        this.api = api
        this.error = null
      }, error => {
        this.error = error
      })
    }
  }
}
</script>

<style>
.openapi {
  padding: 8px;
}

body.md-theme-default.openapi-viewer {
  background-color: transparent;
}
body.md-theme-default.openapi-viewer .openapi .md-list {
  background-color: transparent;
}
body.md-theme-default.openapi-viewer .openapi .md-list .md-list-item-container {
  background-color: transparent;
}

.md-input-container input {
  margin-top: 14px;
}
</style>
