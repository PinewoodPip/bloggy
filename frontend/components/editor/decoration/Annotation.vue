<!-- Decoration for the annotations plugin. -->
<template>
  <UPopover class="select-none h-0" :open="true" :popper="{ placement: 'top-end', offsetDistance: 15 }">
    <!-- This fucking button (or rather, an "Open" default label) is hardcoded into the Nuxt UI popover element - we need to yeet it -->
    <UButton data-btn label="''" class="hidden !h-0" />
    <template #panel>
      <div class="flexcol gap-y-2">
        <!-- List of comments -->
        <div v-for="comment in comments" class="card p-2 bg-neutral w-96 shadow-xl">
          <div class="card-body p-0">
            <!-- Header -->
            <div class="flex items-center gap-x-2">
              <!-- TODO avatar -->
              <AvatarIcon class="size-8" />
              <span class="font-semibold text-neutral-content">{{ comment.type.spec.comment.author }}</span>
            </div>

            <!-- Comment -->
            <p class="text-neutral-content ml-2">{{ comment.type.spec.comment.text }}</p>

            <!-- Actions -->
            <div class="card-actions justify-end">
              <!-- Remove annotation button -->
              <UTooltip text="Removes this annotation.">
                <button class="btn btn-success btn-sm" @click="resolveComment(comment.type.spec.comment.id)">Resolve</button>
              </UTooltip>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { useWidgetViewContext } from '@prosemirror-adapter/vue'

const { spec } = useWidgetViewContext()
const { editor } = useEditorInjects()
const comments = spec?.comments

/** Requests to remove a comment. */
function resolveComment(id: integer) {
  editor.value.executeAction('DeleteAnnotation', {id: id})
}

</script>

<style scoped>
.hash {
  color: blue;
  margin-right: 6px;
}
</style>