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
