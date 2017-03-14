<template>
<div>
  <md-toolbar>
    <md-layout md-row md-align="center">
      <md-layout md-flex="50" md-flex-offset="25">
        <md-input-container>
          <label>OpenAPI JSON location</label>
          <md-input v-model="url"></md-input>
        </md-input-container>
      </md-layout>
      <md-layout>
        <md-button @click.native="refresh"><md-icon>autorenew</md-icon></md-button>
      </md-layout>
    </md-layout>
  </md-toolbar>
  <open-api v-if="api" :api="api"></open-api>
</div>
</template>

<script>
import OpenApi from 'vue-openapi'

export default {
  name: 'app',
  components: {
    OpenApi
  },
  data: () => ({
    api: null,
    url: 'https://koumoul.com/s/geocoder/api/v1/api-docs.json'
  }),
  mounted() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.$http.get('./proxy?url=' + this.url).then(response => response.json()).then(api => this.api = api)
    }
  }
}
</script>
