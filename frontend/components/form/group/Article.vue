<!-- A form component for selecting articles & categories from the site's CMS. -->
<template>
  <UFormGroup :required="required">
    <FormInputField class="select-none" v-model="selectedItemPath" :placeholder="placeholderLabel" :icon="icon" type="text" @click.prevent="onClick" @keyup.enter.prevent="onClick" readonly />

    <!-- Article selection modal -->
    <AdminModalArticleSelect ref="articleSelectModal" :can-select-categories="type === 'category'" :can-select-articles="type === 'article'" @confirm="onItemSelected" />
  </UFormGroup>
</template>

<script setup lang="ts">

const articleSelectModal = useTemplateRef('articleSelectModal')

const props = defineProps<{
  /** The accepted item type. */
  type: 'article' | 'category',
  icon: string,
  placeholder?: string,
  required?: boolean,
}>()

const selectedItemPath = defineModel({
  default: '',
})

/** Opens the article selection modal. */
function onClick() {
  articleSelectModal.value?.open()
}

function onItemSelected(path: path) {
  selectedItemPath.value = path
}

const placeholderLabel = computed(() => {
  return props.type === 'article' ? 'Select article...' : 'Select category...'
})

</script>