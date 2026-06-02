<template>
  <div class="fill-height">
    <v-toolbar
      density="compact"
      color="surface"
      title="Intégration d-frame (dev)"
    >
      <v-spacer />
      <v-btn-toggle
        v-model="urlType"
        mandatory
        density="compact"
        variant="outlined"
        divided
        class="mr-2"
      >
        <v-btn value="petstore" text="petstore" />
        <v-btn value="example" text="example" />
      </v-btn-toggle>
    </v-toolbar>
    <!--
      Reproduit l'intégration de openapi-viewer dans data-fair
      (cf data-fair ui/src/pages/dataset/[id]/api-doc.vue) : mêmes attributs de
      chargement d-frame pour pouvoir tester l'affichage embarqué en local.
    -->
    <d-frame
      :key="urlType"
      id="dev-embed"
      :src="src"
      class="fill-height"
      resize="no"
      sync-params
      emit-iframe-messages
      :adapter.prop="stateChangeAdapter"
      @notif="onNotif"
    />
  </div>
</template>

<script setup lang="ts">
import '@data-fair/frame/lib/d-frame.js'
import createStateChangeAdapter from '@data-fair/frame/lib/vue-router/state-change-adapter'

const router = useRouter()
const stateChangeAdapter = createStateChangeAdapter(router)

const urlType = ref<'petstore' | 'example'>('petstore')

const src = computed(() => {
  const base = `${$sitePath}/openapi-viewer/?drawerLocation=right`
  return urlType.value === 'petstore'
    ? `${base}&urlType=petstore`
    : `${base}&urlType=example&filename=fulltest.json`
})

const onNotif = (e: any) => {
  console.log('notif from embedded openapi-viewer:', e.detail)
}
</script>
