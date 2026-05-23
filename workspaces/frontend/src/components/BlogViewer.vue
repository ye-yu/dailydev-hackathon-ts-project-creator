<script setup lang="ts">
import { computed } from 'vue'
import { useBlogStore } from '@/stores/blog'
import { useLoading } from '@/composables/useLoading'
import { sleep } from '@/utils/delayed'
import BackBar from './blog-viewer/BackBar.vue'
import CodePanel from './blog-viewer/CodePanel.vue'
import EmptyState from './blog-viewer/EmptyState.vue'
import PostPanel from './blog-viewer/PostPanel.vue'
import ViewerTabs from './blog-viewer/ViewerTabs.vue'

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
  blog.generateFilesForActivePost()
}

async function loadContentIfNeeded(): Promise<void> {
  if (!blog.activePost) return
  if (blog.activePost.content) {
    await sleep(500)
    // Content already loaded
    return
  }

  try {
    const response = await fetch(`/api/blog-posts/${blog.activePost.id}/load-content`, {
      method: 'POST',
    })
    if (!response.ok) {
      console.log('Failed to load content', await response.text())
      throw new Error('Failed to load content')
    }
    const data = await response.json()
    if (blog.activePost) {
      blog.activePost.content = data.content || ''
    }
  } catch (error) {
    console.error('Failed to load blog content:', error)
    throw new Error('Failed to load content')
  }
}

const contentLoader = useLoading(loadContentIfNeeded, () => blog.activePost)

function viewPost() {
  blog.setTab('post')
}

function viewCode() {
  blog.setTab('code')
}
</script>

<template>
  <section class="viewer">
    <EmptyState v-if="!blog.activePost" />
    <template v-else>
      <ViewerTabs :active-tab="blog.activeTab" @view-post="viewPost" @view-code="viewCode" />

      <PostPanel
        v-if="blog.activeTab === 'post'"
        :post="blog.activePost"
        :formatted-date="formattedDate"
        :is-loading-content="contentLoader.isLoadingContent.value"
      />

      <CodePanel
        v-else
        :post="blog.activePost"
        :has-files="hasFiles"
        :is-generating-files="blog.isGeneratingFiles"
        @clone="clone"
        @download="download"
        @generate-files="generateFiles"
      />
    </template>
    <BackBar
      :is-fetching-posts="blog.isFetchingPosts"
      :show-mobile-generate-button="showMobileGenerateButton"
      :is-generating-files="blog.isGeneratingFiles"
      @fetch-posts="blog.fetchPosts()"
      @generate-files="generateFiles"
      @back="blog.backToList()"
    />
  </section>
</template>
