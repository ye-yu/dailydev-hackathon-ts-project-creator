<script setup lang="ts">
import type { ViewerTab } from '@/stores/blog'

defineProps<{
  activeTab: ViewerTab
}>()

const emit = defineEmits<{
  (e: 'view-post'): void
  (e: 'view-code'): void
}>()
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      role="tab"
      :aria-selected="activeTab === 'post'"
      :class="{ active: activeTab === 'post' }"
      @click="emit('view-post')"
    >
      Blog Post
    </button>
    <button
      role="tab"
      :aria-selected="activeTab === 'code'"
      :class="{ active: activeTab === 'code' }"
      @click="emit('view-code')"
    >
      Code Setup
    </button>
  </div>
</template>
