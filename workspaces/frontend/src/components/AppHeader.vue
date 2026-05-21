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

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--card);
}
h1 {
  font-size: 1.125rem;
  margin: 0;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.icon-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--foreground);
  cursor: pointer;
}
.primary-btn {
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 0.375rem;
  border: none;
  background: var(--primary);
  color: var(--primary-foreground);
  font-weight: 500;
  cursor: pointer;
}
.primary-btn:hover {
  opacity: 0.9;
}
.icon-btn:hover {
  background: var(--accent);
}
</style>
