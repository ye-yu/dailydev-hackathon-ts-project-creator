<script setup lang="ts">
import { useBlogStore } from '@/stores/blog'

const blog = useBlogStore()
</script>

<template>
  <header class="app-header">
    <h1>Developer Blog</h1>
    <div class="actions">
      <button
        class="icon-btn"
        :aria-label="blog.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        @click="blog.toggleTheme()"
      >
        {{ blog.theme === 'light' ? '🌙' : '☀️' }}
      </button>
      <button class="primary-btn">Login</button>
    </div>
  </header>
</template>
