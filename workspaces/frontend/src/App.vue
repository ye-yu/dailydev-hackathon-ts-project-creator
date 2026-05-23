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

button {
  font-weight: bold;
}

/* App shell */
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

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2.8rem;
  border-bottom: 1px solid var(--border);
  background: var(--card);
}
.app-header h1 {
  font-size: 1.125rem;
  margin: 0;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Buttons */
.icon-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--foreground);
  cursor: pointer;
}
.icon-btn:hover {
  background: var(--accent);
}
.primary-btn {
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 0.375rem;
  border: none;
  background: var(--primary);
  color: var(--primary-foreground);
  cursor: pointer;
}
.primary-btn:hover {
  opacity: 0.9;
}
.primary-btn:disabled {
  opacity: 0.7;
  cursor: wait;
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

/* List panel */
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
.list-panel .primary-btn {
  width: 100%;
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
.cards .empty {
  text-align: center;
  color: var(--muted-foreground);
  font-size: 0.875rem;
}

/* Card */
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
.card h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
}
.card footer {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
.card .desc {
  margin: 0.5rem 0;
  line-height: 1.5;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card .desc a {
  color: inherit;
}

/* Meta / tags (shared by card + post) */
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

/* Viewer */
.viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--card);
  padding: 1rem;
  overflow: hidden;
}
.viewer > .empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
}

/* Viewer tabs */
.tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}
.tabs button {
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--muted-foreground);
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.875rem;
}
.tabs button.active {
  color: var(--foreground);
  border-bottom-color: var(--primary);
}

/* Tab panels (post + code share base) */
.tab-panel {
  flex: 1;
  overflow-y: auto;
  padding-top: 1.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Post panel (non-markdown bits) */
.tab-panel.post h2 {
  margin: 0 0 0.5rem;
}
.tab-panel.post .meta {
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
}
.tab-panel.post .tags {
  margin-bottom: 1rem;
}
.tab-panel.post .tag {
  font-size: 0.75rem;
}
.tab-panel.post .desc {
  font-style: italic;
  color: var(--muted-foreground);
  font-size: 0.9rem;
  line-height: 1.75;
  background-color: #eee;
  padding: 2rem;
  border-radius: 12px;
}
.content {
  line-height: 1.6;
  padding-top: 3rem;
}
.content-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.content-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background: var(--secondary);
  color: var(--secondary-foreground);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 600;
}
.content-link-btn:hover {
  background: var(--accent);
}
.loading {
  margin: 0;
}

/* Code panel */
.git-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.git-url {
  flex: 1;
  padding: 0 0.75rem;
  height: 2.25rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--input);
  color: var(--foreground);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
  box-sizing: border-box;
}
.git-btn {
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background: var(--secondary);
  color: var(--secondary-foreground);
  cursor: pointer;
  font-size: 0.8125rem;
}
.git-btn:hover {
  background: var(--accent);
}
.generate-files-empty {
  min-height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.generate-btn {
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 0.375rem;
  border: none;
  background: var(--primary);
  color: var(--primary-foreground);
  cursor: pointer;
}
.generate-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
.files {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* File accordion */
.accordion {
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  overflow: hidden;
}
.accordion .header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--card);
  color: var(--foreground);
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  text-align: left;
}
.accordion .header:hover {
  background: var(--accent);
}
.accordion .chevron {
  display: inline-block;
  transition: transform 0.15s;
  font-size: 0.625rem;
}
.accordion .chevron.open {
  transform: rotate(90deg);
}
.accordion .path {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.accordion .body {
  margin: 0;
  padding: 0.75rem;
  background: var(--muted);
  color: var(--foreground);
  font-size: 0.8125rem;
  overflow-x: auto;
}

/* Back bar (mobile) */
.back-bar {
  display: none;
}
.back-btn {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background: var(--secondary);
  color: var(--secondary-foreground);
  cursor: pointer;
  font-size: 0.875rem;
}
.back-btn:hover {
  background: var(--accent);
}
.mobile-btn {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .layout.mobile-list > .viewer {
    display: none;
  }
  .layout.mobile-viewer > .list-panel {
    display: none;
  }
  .layout .list-panel {
    width: 100%;
    min-width: 0;
    border-right: none;
  }
  .back-bar {
    display: block;
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
    margin: 0.75rem -1rem -1rem;
    border-top: 1px solid var(--border);
    background: var(--card);
  }
}
</style>
