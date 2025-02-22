<!-- An input field with an icon label. -->
<template>
  <label class="input input-bordered flex items-center gap-2 h-10">
    <UIcon :name="icon"/>
    <input v-model="model" :type="type" :placeholder="placeholder" />
  </label>
</template>

<script setup lang="ts">
const model = defineModel()

interface Props {
  type?: string, // Form input type
  icon: string,
  placeholder: string,
}

const {type = "text"} = defineProps<Props>()

</script>