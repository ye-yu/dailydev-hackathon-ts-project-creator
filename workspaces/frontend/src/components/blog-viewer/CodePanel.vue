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
</script>

<template>
  <div class="tab-panel code">
    <div v-if="hasFiles" class="git-row">
      <input class="git-url" readonly :value="post.gitUrl" aria-label="Git URL" />
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

<style scoped>
.tab-panel {
  flex: 1;
  overflow-y: auto;
  padding-top: 1.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
}
.git-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.git-url {
  flex: 1;
  padding: 0 0.75rem;
  height: 2.25rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--input);
  color: var(--foreground);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
  box-sizing: border-box;
}
.git-btn {
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background: var(--secondary);
  color: var(--secondary-foreground);
  cursor: pointer;
  font-size: 0.8125rem;
}
.git-btn:hover {
  background: var(--accent);
}
.generate-files-empty {
  min-height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.generate-btn {
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 0.375rem;
  border: none;
  background: var(--primary);
  color: var(--primary-foreground);
  cursor: pointer;
  font-weight: 600;
}
.generate-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
.files {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
