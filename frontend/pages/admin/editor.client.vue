<!-- Article editor page -->
<template>
  <UContainer class="flexcol gap-y-2">
    <!-- Header -->
    <div class="large-content-block flex">
      <UIcon name="i-material-symbols-article-outline" class="w-20 h-20"/>

      <!-- File path and menu -->
      <div class="flexcol">
        <h1>{{ fullPath }}</h1>

        <VerticalFill/>

        <!-- Menu button links -->
        <ul class="menu menu-horizontal flex-row bg-base-200">
          <li><a @click="openFileMenu">File</a></li>
          <li><a @click="openViewMenu">View</a></li>
          <li><a @click="openSettingsMenu">Settings</a></li>
        </ul>
      </div>

      <HorizontalFill/>

      <!-- Session management buttons -->
      <div class="flex gap-x-2 my-auto">
        <IconButton icon="i-material-symbols-save-outline" class="btn-primary" @click="saveDocument">Publish</IconButton>
        <IconButton icon="i-heroicons-archive-box-arrow-down" class="btn-primary" @click="saveDraft">Save draft</IconButton>
        <IconButton icon="i-heroicons-arrow-left-end-on-rectangle-solid" class="btn-error" @click="saveDraft">Exit</IconButton>
      </div>

    </div>

    <!-- Toolbar -->
    <EditorToolbar/>

    <!-- Content area -->
    <div class="flex gap-x-2">
      <!-- Sidebar -->
      <div class="large-content-block">
        TODO
      </div>

      <!-- Document -->
      <div class="large-content-block flex-grow">
        <p>TODO</p>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">

function openFileMenu() {
  // TODO
}

function openViewMenu() {
  // TODO
}

function openSettingsMenu() {
  // TODO
}

function saveDocument() {
  // TODO
}

function saveDraft() {
  // TODO
}

const fullPath = computed(() => {
  return "TODO"
})

</script>