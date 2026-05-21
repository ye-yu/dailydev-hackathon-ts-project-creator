<script setup lang="ts">
import { useBlogStore } from '@/stores/blog'
import BlogCard from './BlogCard.vue'

const blog = useBlogStore()
</script>

<template>
  <section class="list-panel">
    <div class="search-bar">
      <input
        v-model="blog.search"
        type="search"
        placeholder="Search blog posts..."
        aria-label="Search blog posts"
      />
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
  width: 40%;
  min-width: 320px;
  border-right: 1px solid var(--border);
  background: var(--background);
}
.search-bar {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--card);
}
.search-bar input {
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
.cards {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
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
