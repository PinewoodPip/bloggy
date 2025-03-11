<!-- Wrapper for UDropdown to override its theming with daisyUI classes -->
<template>
  <UDropdown data-nuxtui-dropdown class="p-0" :ui="{ strategy: 'override', wrapper: '', container: '', shadow: '', divide: '', ring: 'bg-base-100', background: 'bg-base-300', item: {inactive: 'bg-base-300 text-base-content', active: 'bg-base-200 text-base-content'} }" :popper="{ placement: 'bottom-start' }">
    <slot/>
  </UDropdown>
</template>