<script setup lang="ts">
import { computed } from 'vue'
import { useBlogStore } from '@/stores/blog'
import FileAccordion from './FileAccordion.vue'

const blog = useBlogStore()

const hasFiles = computed(() => (blog.activePost?.files?.length ?? 0) > 0)
const showMobileGenerateButton = computed(
  () => blog.activeTab === 'code' && Boolean(blog.activePost) && !hasFiles.value,
)

const formattedDate = computed(() => {
  const p = blog.activePost
  if (!p) return ''
  return new Date(p.timestamp).toLocaleString()
})

function clone() {
  const url = blog.activePost?.gitUrl
  if (url) navigator.clipboard?.writeText(`git clone ${url}`)
}

function download() {
  const url = blog.activePost?.gitUrl
  if (url) window.open(url.replace(/\.git$/, '/archive/refs/heads/main.zip'), '_blank')
}

function generateFiles() {
  void blog.generateFilesForActivePost()
}
</script>

<template>
  <section class="viewer">
    <div v-if="!blog.activePost" class="empty">Select a blog post to view details</div>
    <template v-else>
      <div class="tabs" role="tablist">
        <button
          role="tab"
          :aria-selected="blog.activeTab === 'post'"
          :class="{ active: blog.activeTab === 'post' }"
          @click="blog.setTab('post')"
        >
          Blog Post
        </button>
        <button
          role="tab"
          :aria-selected="blog.activeTab === 'code'"
          :class="{ active: blog.activeTab === 'code' }"
          @click="blog.setTab('code')"
        >
          Code Setup
        </button>
      </div>

      <div v-if="blog.activeTab === 'post'" class="tab-panel post">
        <h2>{{ blog.activePost.title }}</h2>
        <p class="meta">{{ formattedDate }} · By {{ blog.activePost.author }}</p>
        <div class="tags">
          <span v-for="t in blog.activePost.tags" :key="t" class="tag">{{ t }}</span>
        </div>
        <p class="desc">{{ blog.activePost.description }}</p>
        <article class="content">{{ blog.activePost.content }}</article>
      </div>

      <div v-else class="tab-panel code">
        <div v-if="hasFiles" class="git-row">
          <input class="git-url" readonly :value="blog.activePost.gitUrl" aria-label="Git URL" />
          <button class="git-btn" @click="clone">Clone</button>
          <button class="git-btn" @click="download">Download</button>
        </div>
        <div v-if="hasFiles" class="files">
          <FileAccordion v-for="file in blog.activePost.files" :key="file.path" :file="file" />
        </div>
        <div v-else class="generate-files-empty">
          <button class="generate-btn" :disabled="blog.isGeneratingFiles" @click="generateFiles()">
            {{ blog.isGeneratingFiles ? 'Generating...' : 'Generate files' }}
          </button>
        </div>
      </div>
    </template>
    <div class="back-bar">
      <button
        class="back-btn mobile-btn"
        :disabled="blog.isFetchingPosts"
        @click="blog.fetchPosts()"
      >
        {{ blog.isFetchingPosts ? 'Fetching posts...' : 'Fetch Posts' }}
      </button>
      <button
        v-if="showMobileGenerateButton"
        class="back-btn mobile-btn"
        :disabled="blog.isGeneratingFiles"
        @click="generateFiles()"
      >
        {{ blog.isGeneratingFiles ? 'Generating files...' : 'Generate files' }}
      </button>
      <button class="back-btn" type="button" @click="blog.backToList()">← Back</button>
    </div>
  </section>
</template>

<style scoped>
.viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--card);
  padding: 1rem;
  overflow: hidden;
}
.back-bar {
  display: none;
}
.mobile-btn {
  margin-bottom: 0.5rem;
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
@media (max-width: 768px) {
  .back-bar {
    display: block;
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
    margin: 0.75rem -1rem -1rem;
    border-top: 1px solid var(--border);
    background: var(--card);
  }
}
.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
}
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
.tab-panel {
  flex: 1;
  overflow-y: auto;
  padding-top: 1.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
}
.post h2 {
  margin: 0 0 0.5rem;
}
.meta {
  color: var(--muted-foreground);
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
}
.tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.tag {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--accent);
  color: var(--accent-foreground);
}
.desc {
  font-style: italic;
  color: var(--muted-foreground);
}
.content {
  white-space: pre-wrap;
  line-height: 1.6;
  padding-top: 1rem;
}
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
  font-weight: 600;
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
</style>
