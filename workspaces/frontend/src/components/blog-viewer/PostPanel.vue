<script setup lang="ts">
import type { BlogPostLazy } from '@ye-yu/shared/entities'

defineProps<{
  post: BlogPostLazy
  formattedDate: string
  isLoadingContent: boolean
}>()
</script>

<template>
  <div class="tab-panel post">
    <h2>{{ post.title }}</h2>
    <p class="meta">{{ formattedDate }} · By {{ post.author }}</p>
    <div class="tags">
      <span v-for="t in post.tags" :key="t" class="tag">{{ t }}</span>
    </div>
    <p class="desc">{{ post.description }}</p>
    <article class="content">
      {{ isLoadingContent ? 'Loading...' : post.content }}
    </article>
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
.post h2 {
  margin: 0 0 0.5rem;
}
.meta {
  color: var(--muted-foreground);
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
}
.tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.tag {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--accent);
  color: var(--accent-foreground);
}
.desc {
  font-style: italic;
  color: var(--muted-foreground);
}
.content {
  white-space: pre-wrap;
  line-height: 1.6;
  padding-top: 1rem;
}
</style>
