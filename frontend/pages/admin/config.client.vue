<template>
  <AdminPage header="Content" icon="material-symbols:settings-rounded" hint="Manage site-wide configuration.">

    <!-- Branding -->
    <h2 class="mt-2">Branding</h2>
    <div class="flex">
      <div class="flexcol flex-grow">
        <!-- Site name -->
        <FormGroupInputField v-model="state.site_name" label="Site name" hint="Shown in title bar." icon="material-symbols:drive-file-rename-outline" />
      </div>
      <div class="flexcol flex-grow">

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

const state: Reactive<SiteConfigUpdate> = reactive({
  site_name: '',
})

function applyChanges() {
  const enabledNetworksList: string[] = []
  for (const network in enabledNetworks) {
    if (enabledNetworks[network] === true) {
      enabledNetworksList.push(network)
    }
  }
  requestPatch({
    social_networks: enabledNetworksList,
    ...state,
  })
}

// Initialize models when config loads
watch(config, () => {
  for (const network in config.value?.social_networks) {
    enabledNetworks[network] = config.value.social_networks[network].can_share
  }
  state.site_name = config.value?.site_name
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