<script setup lang="ts">
defineProps<{
  isFetchingPosts: boolean
  showMobileGenerateButton: boolean
  isGeneratingFiles: boolean
}>()

const emit = defineEmits<{
  (e: 'fetch-posts'): void
  (e: 'generate-files'): void
  (e: 'back'): void
}>()
</script>

<template>
  <div class="back-bar">
    <button class="back-btn mobile-btn" :disabled="isFetchingPosts" @click="emit('fetch-posts')">
      {{ isFetchingPosts ? 'Fetching posts...' : 'Fetch Posts' }}
    </button>
    <button
      v-if="showMobileGenerateButton"
      class="back-btn mobile-btn"
      :disabled="isGeneratingFiles"
      @click="emit('generate-files')"
    >
      {{ isGeneratingFiles ? 'Generating files...' : 'Generate files' }}
    </button>
    <button class="back-btn" type="button" @click="emit('back')">← Back</button>
  </div>
</template>

<style scoped>
.back-bar {
  display: none;
}
.mobile-btn {
  margin-bottom: 0.5rem;
}
.back-btn {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background: var(--secondary);
  color: var(--secondary-foreground);
  cursor: pointer;
  font-size: 0.875rem;
}
.back-btn:hover {
  background: var(--accent);
}
@media (max-width: 768px) {
  .back-bar {
    display: block;
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
    margin: 0.75rem -1rem -1rem;
    border-top: 1px solid var(--border);
    background: var(--card);
  }
}
</style>
