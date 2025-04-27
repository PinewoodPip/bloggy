<!-- Displays basic article metadata and menu bar. -->
<template>
  <div class="large-content-block flex">
    <!-- Document icon -->
    <UIcon name="i-material-symbols-article-outline" class="w-20 h-20"/>

    <!-- File path and menu -->
    <div class="flexcol">
      <!-- Title and path -->
      <div class="pt-3 pl-3">
        <span class="flex items-center">
          <!-- Title field -->
          <span class="min-w-10 font-bold text-lg px-2 mr-3" ref="titleField" contenteditable="true" @focusout="onTitleFieldFocusOut">{{ articlePatchData.title }}</span> <!-- Contenteditable does not support v-model -->

          <!-- Path -->
          <span class="flex items-center">
            <UIcon name="i-material-symbols-link" class="mr-2" />
            <code class="text-base-content/80">{{ article?.path }}</code>
          </span>
        </span>
      </div>

      <VerticalFill/>

      <!-- Menu button links -->
      <ul class="menu menu-horizontal flex-row bg-base-200">
        <!-- File menu -->
        <li>
          <Dropdown :items="fileDropdownItems">
            <UButton label="File" />
          </Dropdown>
        </li>
        <!-- View menu -->
        <li>
          <Dropdown :items="viewDropdownItems">
            <UButton label="View" />
          </Dropdown>
        </li>
        <!-- Settings menu; opens a modal instead -->
        <li><a @click="openSettingsMenu">Settings</a></li>
      </ul>
    </div>

    <HorizontalFill/>

    <!-- Session management buttons -->
    <div class="flex gap-x-2 my-auto">
      <MutationButton icon="i-material-symbols-save-outline" class="btn-smp btn-primary" :status="articleMutation.status.value" @click="saveDocument">Publish</MutationButton>
      <IconButton icon="i-heroicons-archive-box-arrow-down" class="btn-smp btn-primary" @click="saveDraft">Save draft</IconButton>
      <IconButton icon="i-heroicons-arrow-left-end-on-rectangle-solid" class="btn-smp btn-error" @click="exit">Exit</IconButton>
    </div>
  </div>

  <!-- Settings menu modal -->
  <UModal v-model="settingsMenuVisible" :overlay="true">
    <ArticleEditorModalSettings @close="settingsMenuVisible = false"/>
  </UModal>

  <!-- Metadata modal -->
  <AdminContentArticleEditModal v-if="article" v-model="documentPropertiesVisible" :article="article" :category-path="article.category_path" @update="onMetadataUpdated" />
</template>

<script setup lang="ts">
import { ArticleEditorModalSettings } from '#components'
import type { Reactive } from 'vue'

const router = useRouter()
const { articleMutation, saveDocument, validateMetadata, articleQuery } = useArticleEditorQueries()
const titleField = useTemplateRef('titleField')

const props = defineProps<{
  article: Article | undefined | null,
}>();

const articlePatchData: Reactive<ArticleUpdateRequest> = reactive({
  title: '',
})
watchEffect(() => {
  if (props.article) {
    // Update title
    articlePatchData.title = props.article.title
  }
})

const emit = defineEmits<{
  toggleSidebar: [],
  metadataUpdated: [Article],
}>();

const settingsMenuVisible = ref(false)
const documentPropertiesVisible = ref(false)

const fileDropdownItems = [
  [
    {
      label: 'Save & publish',
      icon: 'i-heroicons-book-open-16-solid',
      click: () => {
        saveDocument(articlePatchData)
      }
    },
    {
      // TODO only show this option if unpublished
      label: 'Save as draft',
      icon: 'i-heroicons-pencil-square',
      click: () => {
        saveDraft()
      }
    },
    {
      label: 'Document properties',
      icon: 'i-heroicons-document-text',
      click: () => {
        editDocumentProperties()
      }
    },
  ]
]
const viewDropdownItems = [
  [
    {
      label: 'Markdown mode',
      icon: 'i-material-symbols-markdown-outline',
      click: () => {
        toggleMarkdownView()
      }
    },
    {
      label: 'Table of contents',
      icon: 'i-material-symbols-data-table-outline',
      click: () => {
        toggleTableOfContents()
      }
    },
  ]
]

function openFileMenu() {
  // TODO
}

function openViewMenu() {
  // TODO
}

function openSettingsMenu() {
  settingsMenuVisible.value = true
}

/** Requests to patch the article title if it was changed. */
function onTitleFieldFocusOut() {
  const title = titleField.value?.textContent
  if (title !== props.article?.title && title) {
    articlePatchData.title = title || props.article!.title 
    validateMetadata(articlePatchData)
    articleMutation.mutate(articlePatchData)
  } else {
    titleField.value!.textContent = props.article!.title // Reset the field to the new title; this will also undo invalid title changes
  }
}

function saveDraft() {
  // TODO
}

function toggleMarkdownView() {
  // TODO
}

function toggleTableOfContents() {
  emit('toggleSidebar')
}

/** Opens the metadata editor. */
function editDocumentProperties() {
  documentPropertiesVisible.value = true
}

/** Saves the document as a draft and returns to the admin panel. */
function exit() {
  saveDraft()
  router.push('/admin/content')
}

function onMetadataUpdated(article: Article) {
  emit('metadataUpdated', article)
}

</script>