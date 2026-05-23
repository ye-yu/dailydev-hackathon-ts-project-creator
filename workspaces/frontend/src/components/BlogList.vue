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
