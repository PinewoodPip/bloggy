<!-- A button associated with a vue-query mutation; will show a loading spinner while the mutation is pending. Slot corresponds to button content. -->
<template>
  <IconButton class="btn-primary" :icon="status !== 'pending' ? icon : ''" :disabled="status === 'pending' || disabled">
    <span v-if="status === 'pending'" class="loading loading-spinner loading-xs" />
    <span><slot/></span>
  </IconButton>
</template>

<script setup lang="ts">

const props = defineProps<{
  icon: string,
  status: string,
  disabled?: boolean,
}>()

</script>