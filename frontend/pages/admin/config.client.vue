<template>
  <AdminPage header="Content" icon="material-symbols:settings-rounded" hint="Manage site-wide configuration.">

    <!-- Branding -->
    <h2 class="mt-2">Branding</h2>
    <div class="flex gap-x-5">
      <div class="flexcol flex-grow gap-y-2">
        <!-- Site name -->
        <FormGroupInputField v-model="configUpdate.site_name" label="Site name" hint="Shown in title bar." icon="material-symbols:drive-file-rename-outline" />

        <!-- Favicon -->
        <FormGroupSiteFile v-model="configUpdate.favicon_path" label="Favicon" hint="Icon shown by the browser tab." icon="material-symbols:star" />
      </div>
      <div class="flexcol flex-grow">
        <FormGroupSiteImage v-model="configUpdate.logo_path" label="Logo" />
      </div>
    </div>

    <hr class="my-2" />

    <!-- Settings -->
    <div v-if="configStatus === 'success'" class="flex-grow overflow-x-auto">
      <!-- Theming -->
      <FormGroupMultiselect v-model="configUpdate.theme" :options="themes" :multiple="false" label="Theme" help="Determines the site's color scheme." :show-labels="true" :searchable="true" placeholder="Select theme" aria-label="select theme" @update:model-value="onThemeChanged" />

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
import { _themes as daisyThemes } from '#tailwind-config/daisyui'
import { useMutation, useQuery } from '@tanstack/vue-query'
import type { Reactive } from 'vue'
import type { SiteConfigUpdate } from '~/services/site'

const siteService = useSiteService()
const responseToast = useResponseToast()
const { data: config, status: configStatus } = useSiteConfig()
const colorMode = useColorMode();

const themes = [
  "system", ...new Set(daisyThemes)
];

const enabledNetworks: Reactive<{[id: string]: boolean}> = reactive({})
const configUpdate: Reactive<SiteConfigUpdate> = reactive({})

function applyChanges() {
  const enabledNetworksList: string[] = []
  for (const network in enabledNetworks) {
    if (enabledNetworks[network] === true) {
      enabledNetworksList.push(network)
    }
  }
  requestPatch({
    ...configUpdate, // Should be done first so its "unused" properties get overwritten (ex. the network map)
    social_networks: enabledNetworksList,
  })
}

// Initialize models when config is fetched
function initializeModel() {
  configUpdate.logo_path = config.value?.logo?.path
  configUpdate.favicon_path = config.value?.favicon?.path
  configUpdate.theme = config.value?.theme
  for (const network in config.value?.social_networks) {
    enabledNetworks[network] = config.value.social_networks[network].can_share
  }
}
onMounted(() => {
  initializeModel()
})
watch(config, () => {
  initializeModel()
})

/** Previews the selected theme. */
function onThemeChanged() {
  if (configUpdate.theme) {
    colorMode.preference = configUpdate.theme
  }
}

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