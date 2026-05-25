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
const hasFiles = computed(() => (props.post.files?.length ?? 0) > 0)

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
        v-if="hasFiles"
        class="secondary-btn"
        :class="{ highlight: activeTab === 'code' }"
        @click="open('code')"
      >
        Setup Code
      </button>
    </footer>
  </article>
</template>
