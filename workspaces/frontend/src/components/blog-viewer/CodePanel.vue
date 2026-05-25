<script setup lang="ts">
import type { BlogPostLazy } from '@ye-yu/shared/entities'
import FileAccordion from './FileAccordion.vue'

defineProps<{
  post: BlogPostLazy
  hasFiles: boolean
  isGeneratingFiles: boolean
}>()

const emit = defineEmits<{
  (e: 'clone'): void
  (e: 'download'): void
  (e: 'generate-files'): void
}>()

const gitUrl = computed(() => {
  const origin = new URL(window.location).origin
  const pathName = post.gitUrl
  const fullUrl = new URL(pathName, origin).href
  return fullUrl
})
</script>

<template>
  <div class="tab-panel code">
    <div v-if="hasFiles" class="git-row">
      <input class="git-url" readonly :value="gitUrl" aria-label="Git URL" />
      <button class="git-btn" @click="emit('clone')">Clone</button>
      <button class="git-btn" @click="emit('download')">Download</button>
    </div>
    <div v-if="hasFiles" class="files">
      <FileAccordion v-for="file in post.files" :key="file.path" :file="file" />
    </div>
    <div v-else class="generate-files-empty">
      <button class="generate-btn" :disabled="isGeneratingFiles" @click="emit('generate-files')">
        {{ isGeneratingFiles ? 'Generating...' : 'Generate files' }}
      </button>
    </div>
  </div>
</template>
