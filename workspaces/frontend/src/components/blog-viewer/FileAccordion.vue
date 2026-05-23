<script setup lang="ts">
import { ref } from 'vue'
import type { BlogFileLazy } from '@ye-yu/shared/entities'

defineProps<{ file: BlogFileLazy }>()
const open = ref(false)
</script>

<template>
  <div class="accordion">
    <button class="header" :aria-expanded="open" @click="open = !open">
      <span class="chevron" :class="{ open }">▶</span>
      <span class="path">{{ file.path }}</span>
    </button>
    <pre v-show="open" class="body"><code>{{ file.content }}</code></pre>
  </div>
</template>

<style scoped>
.accordion {
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  overflow: hidden;
}
.header {
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
.header:hover {
  background: var(--accent);
}
.chevron {
  display: inline-block;
  transition: transform 0.15s;
  font-size: 0.625rem;
}
.chevron.open {
  transform: rotate(90deg);
}
.path {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.body {
  margin: 0;
  padding: 0.75rem;
  background: var(--muted);
  color: var(--foreground);
  font-size: 0.8125rem;
  overflow-x: auto;
}
</style>
