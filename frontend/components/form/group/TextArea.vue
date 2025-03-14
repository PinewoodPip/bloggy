<!-- Wrapper for UFormGroup and TextArea. -->
<template>
  <UFormGroup>
    <TextArea v-model="model" />
  </UFormGroup>
</template>

<script setup lang="ts">

const model = defineModel({
  default: '',
})

</script>