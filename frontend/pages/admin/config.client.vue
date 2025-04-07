<template>
  <AdminPage header="Content" icon="material-symbols:settings-rounded" hint="Manage site-wide configuration.">

    <!-- Branding -->
    <h2 class="mt-2">Branding</h2>
    <div class="flex gap-x-5">
      <div class="flexcol flex-grow gap-y-2">
        <!-- Site name -->
        <FormGroupInputField v-model="state.site_name" label="Site name" hint="Shown in title bar." icon="material-symbols:drive-file-rename-outline" />

        <!-- Favicon -->
        <FormGroupSiteFile v-model="state.favicon_path" label="Favicon" hint="Icon shown by the browser tab." icon="material-symbols:star" />
      </div>
      <div class="flexcol flex-grow">
        <FormGroupSiteImage v-model="state.logo_path" label="Logo" />
      </div>
    </div>

    <hr class="my-2" />

    <!-- Settings -->
    <div v-if="configStatus === 'success'" class="flex-grow overflow-x-auto">
      <!-- Social networks -->
      <h2>Social Media Sharing</h2>
      <p>Select the social media networks that sharing options will be available for in article pages.</p>
      <div class="flexcol">
        <FormGroupCheckbox v-for="network in config?.social_networks" v-model="enabledNetworks[network.id]" :icon="NETWORK_ICONS[network.id] || 'material-symbols:question-mark'" :label="network.name" />
      </div>
    </div>
    <LoadingSpinner v-else />

    <hr class="my-2" />

    <MutationButton class="max-w-lg mx-auto" icon="material-symbols:save" :status="patchStatus" @click="applyChanges">Save</MutationButton>
  </AdminPage>
</template>

<script setup lang="ts">
import { useMutation, useQuery } from '@tanstack/vue-query'
import type { Reactive } from 'vue'
import type { SiteConfigUpdate } from '~/services/site'

const siteService = useSiteService()
const responseToast = useResponseToast()

const enabledNetworks: Reactive<{[id: string]: boolean}> = reactive({})

const { data: config, status: configStatus } = useSiteConfig()

const state: Reactive<SiteConfigUpdate> = reactive({})

function applyChanges() {
  const enabledNetworksList: string[] = []
  for (const network in enabledNetworks) {
    if (enabledNetworks[network] === true) {
      enabledNetworksList.push(network)
    }
  }
  requestPatch({
    ...state, // Should be done first so its "unused" properties get overwritten (ex. the network map)
    social_networks: enabledNetworksList,
  })
}

// Initialize models when config loads
watch(config, () => {
  Object.assign(state, config.value)
  state.logo_path = config.value?.logo?.path
  state.favicon_path = config.value?.favicon?.path
  for (const network in config.value?.social_networks) {
    enabledNetworks[network] = config.value.social_networks[network].can_share
  }
})

/** Query for updating the config */
const { mutate: requestPatch, status: patchStatus } = useMutation({
  mutationFn: (request: SiteConfigUpdate) => {
    return siteService.updateSiteConfig(request)
  },
  onSuccess: (article) => {
    responseToast.showSuccess('Configuration updated')
  },
  onError: (err) => {
    responseToast.showError('Failed to update configuration', err)
  }
})

</script>