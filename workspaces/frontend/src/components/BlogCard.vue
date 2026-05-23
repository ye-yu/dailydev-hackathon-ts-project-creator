<script setup lang="ts">
import { computed } from 'vue'
import { useBlogStore, type ViewerTab } from '@/stores/blog'
import type { BlogPostLazy } from '@ye-yu/shared/entities'
import { renderMarkdownInline } from '@/utils/markdown'

const props = defineProps<{ post: BlogPostLazy }>()
const blog = useBlogStore()

const isActive = computed(() => blog.activePostId === props.post.id)
const activeTab = computed(() => (isActive.value ? blog.activeTab : null))
const descriptionHtml = computed(() => renderMarkdownInline(props.post.description))

const formattedDate = computed(() =>
  new Date(props.post.timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }),
)

function open(tab: ViewerTab) {
  blog.selectPost(props.post.id, tab)
}
</script>

<template>
  <article class="card" :class="{ active: isActive }">
    <header>
      <h4>{{ post.title }}</h4>
      <p class="meta">{{ formattedDate }} · By {{ post.author }}</p>
    </header>
    <div class="tags">
      <span v-for="t in post.tags" :key="t" class="tag">{{ t }}</span>
    </div>
    <p class="desc" v-html="descriptionHtml"></p>
    <footer>
      <button
        class="secondary-btn"
        :class="{ highlight: activeTab === 'post' }"
        @click="open('post')"
      >
        View Blog
      </button>
      <button
        class="secondary-btn"
        :class="{ highlight: activeTab === 'code' }"
        @click="open('code')"
      >
        Setup Code
      </button>
    </footer>
  </article>
</template>

<style scoped>
.card {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--card);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.card.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}
h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
}
.meta {
  margin: 0;
  font-size: 0.75rem;
  color: var(--muted-foreground);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.tag {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--accent);
  color: var(--accent-foreground);
}
.desc {
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.desc :deep(a) {
  color: inherit;
}
footer {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
.secondary-btn {
  flex: 1;
  height: 2rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background: var(--secondary);
  color: var(--secondary-foreground);
  font-size: 0.8125rem;
  cursor: pointer;
}
.secondary-btn:hover {
  background: var(--accent);
}
.secondary-btn.highlight {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
</style>
