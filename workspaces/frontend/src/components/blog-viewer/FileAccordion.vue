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
