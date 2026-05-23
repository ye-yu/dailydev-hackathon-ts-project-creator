<script setup lang="ts">
import { computed } from 'vue'
import type { BlogPostLazy } from '@ye-yu/shared/entities'
import { renderMarkdown, renderMarkdownWithHighlight } from '@/utils/markdown'

const props = defineProps<{
  post: BlogPostLazy
  formattedDate: string
  isLoadingContent: boolean
}>()

const descriptionHtml = computed(() => renderMarkdown(props.post.description))
const contentHtml = computed(() => renderMarkdownWithHighlight(props.post.content))
</script>

<template>
  <div class="tab-panel post">
    <h2>{{ post.title }}</h2>
    <p class="meta">{{ formattedDate }} · By {{ post.author }}</p>
    <div class="tags">
      <span v-for="t in post.tags" :key="t" class="tag">{{ t }}</span>
    </div>
    <div class="desc markdown" v-html="descriptionHtml"></div>
    <article class="content markdown-content">
      <div v-if="post.externalUrl || post.dailyDevUrl" class="content-links">
        <a
          v-if="post.externalUrl"
          class="content-link-btn"
          :href="post.externalUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          View External URL
        </a>
        <a
          v-if="post.dailyDevUrl"
          class="content-link-btn"
          :href="post.dailyDevUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          View daily.dev
        </a>
      </div>
      <p v-if="isLoadingContent" class="loading">Loading...</p>
      <div v-else v-html="contentHtml"></div>
    </article>
  </div>
</template>

<style scoped>
.markdown :deep(p),
.markdown-content :deep(p) {
  margin: 0 0 0.75rem;
}
.markdown :deep(p:last-child),
.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown :deep(h1),
.markdown-content :deep(h1) {
  padding-top: 3rem;
}
.markdown :deep(h2),
.markdown-content :deep(h2) {
  padding-top: 2.5rem;
}
.markdown-content :deep(pre.hljs) {
  margin: 0.75rem 0;
  border-radius: 0.5rem;
  padding: 0.75rem;
  overflow-x: auto;
  background: var(--muted);
}
.markdown-content :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
</style>
