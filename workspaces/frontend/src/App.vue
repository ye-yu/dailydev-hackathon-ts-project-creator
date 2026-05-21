<script setup lang="ts">
import { computed } from 'vue'
import { useBlogStore } from '@/stores/blog'
import AppHeader from '@/components/AppHeader.vue'
import BlogList from '@/components/BlogList.vue'
import BlogViewer from '@/components/BlogViewer.vue'

const blog = useBlogStore()
const themeClass = computed(() => `theme-${blog.theme}`)
</script>

<template>
  <div class="app" :class="themeClass">
    <AppHeader />
    <main class="layout" :class="`mobile-${blog.mobileView}`">
      <BlogList />
      <BlogViewer />
    </main>
  </div>
</template>

<style>
:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --border: #e2e8f0;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --input: #ffffff;
}
.theme-dark {
  --background: #0f172a;
  --foreground: #f8fafc;
  --card: #1e293b;
  --border: #334155;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #334155;
  --accent-foreground: #f8fafc;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --secondary: #334155;
  --secondary-foreground: #f8fafc;
  --input: #1e293b;
}
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}
body {
  font-family: 'Helvetica Neue', Roboto, sans-serif;
}
</style>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background);
  color: var(--foreground);
}
.layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

@media (max-width: 768px) {
  .layout.mobile-list > :deep(.viewer) {
    display: none;
  }
  .layout.mobile-viewer > :deep(.list-panel) {
    display: none;
  }
  .layout :deep(.list-panel) {
    width: 100%;
    min-width: 0;
    border-right: none;
  }
}
</style>
