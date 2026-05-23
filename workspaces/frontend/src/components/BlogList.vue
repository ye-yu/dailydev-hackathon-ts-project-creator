<script setup lang="ts">
import { onMounted } from 'vue'
import { useBlogStore } from '@/stores/blog'
import BlogCard from './BlogCard.vue'

const blog = useBlogStore()

onMounted(() => {
  if (import.meta.env.MODE !== 'test') {
    void blog.loadPosts()
  }
})
</script>

<template>
  <section class="list-panel">
    <div class="controls">
      <input
        v-model="blog.search"
        type="search"
        placeholder="Search blog posts..."
        aria-label="Search blog posts"
      />

      <button class="primary-btn" :disabled="blog.isFetchingPosts" @click="blog.fetchPosts()">
        {{ blog.isFetchingPosts ? 'Fetching...' : 'Fetch Posts' }}
      </button>

      <p v-if="blog.lastFetchWarning" class="warning">{{ blog.lastFetchWarning }}</p>
    </div>
    <div class="cards">
      <BlogCard v-for="post in blog.filteredPosts" :key="post.id" :post="post" />
      <p v-if="!blog.filteredPosts.length" class="empty">No posts match your search.</p>
    </div>
  </section>
</template>

<style scoped>
.list-panel {
  display: flex;
  flex-direction: column;
  width: 30%;
  min-width: 320px;
  border-right: 1px solid var(--border);
  background: var(--background);
}
.controls {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--card);
  margin-left: 1rem;
  margin-right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.controls input {
  width: 100%;
  height: 2.25rem;
  padding: 0 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--input);
  color: var(--foreground);
  font-size: 0.875rem;
  box-sizing: border-box;
}
.primary-btn {
  width: 100%;
  height: 2.25rem;
  border-radius: 0.375rem;
  border: none;
  background: var(--primary);
  color: var(--primary-foreground);
  font-weight: 600;
  cursor: pointer;
}
.primary-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
.warning {
  margin: 0;
  font-size: 0.75rem;
  color: #b45309;
}
.cards {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.empty {
  text-align: center;
  color: var(--muted-foreground);
  font-size: 0.875rem;
}
</style>
