import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { FetchBlogPostsResponse, GetBlogPostsResponse } from '@ye-yu/shared/blog-api'
import type { BlogPostLazy } from '@ye-yu/shared/entities'

export type ViewerTab = 'post' | 'code'
export type Theme = 'light' | 'dark'
export type MobileView = 'list' | 'viewer'

const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '') ?? ''

function toApiUrl(path: string): string {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export const useBlogStore = defineStore('blog', () => {
  const posts = ref<BlogPostLazy[]>([])
  const search = ref('')
  const activePostId = ref<string | null>(null)
  const activeTab = ref<ViewerTab>('post')
  const theme = ref<Theme>('light')
  const mobileView = ref<MobileView>('list')
  const isLoadingPosts = ref(false)
  const isFetchingPosts = ref(false)
  const isGeneratingFiles = ref(false)
  const lastFetchWarning = ref<string | null>(null)

  const filteredPosts = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return posts.value
    return posts.value.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    )
  })

  const activePost = computed(() => posts.value.find((p) => p.id === activePostId.value) ?? null)

  function selectPost(id: string, tab: ViewerTab) {
    activePostId.value = id
    activeTab.value = tab
    mobileView.value = 'viewer'
  }

  function setTab(tab: ViewerTab) {
    activeTab.value = tab
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function backToList() {
    mobileView.value = 'list'
  }

  async function loadPosts() {
    isLoadingPosts.value = true
    try {
      const response = await fetch(toApiUrl('/api/blog-posts'))
      const payload = await readJsonResponse<GetBlogPostsResponse>(response)
      posts.value = payload.posts.map((post) => ({
        ...post,
        files: post.files ?? [],
      }))

      if (activePostId.value && !posts.value.find((post) => post.id === activePostId.value)) {
        activePostId.value = null
      }
    } catch (error) {
      console.error('Failed to load posts', error)
    } finally {
      isLoadingPosts.value = false
    }
  }

  async function fetchPosts() {
    isFetchingPosts.value = true
    try {
      const response = await fetch(toApiUrl('/api/blog-posts/fetch'), {
        method: 'POST',
      })
      const payload = await readJsonResponse<FetchBlogPostsResponse>(response)

      lastFetchWarning.value = payload.throttled
        ? 'Fetch ignored: please wait before fetching again.'
        : null

      await loadPosts()
    } catch (error) {
      console.error('Failed to fetch posts', error)
      lastFetchWarning.value = 'Failed to fetch posts. Please try again.'
    } finally {
      isFetchingPosts.value = false
    }
  }

  async function generateFilesForActivePost() {
    const postId = activePostId.value
    if (!postId) {
      return
    }

    isGeneratingFiles.value = true
    try {
      const response = await fetch(
        toApiUrl(`/api/blog-posts/${encodeURIComponent(postId)}/generate-files`),
        {
          method: 'POST',
        },
      )

      if (!response.ok) {
        throw new Error(`Generate files failed with status ${response.status}`)
      }

      await loadPosts()
    } catch (error) {
      console.error('Failed to generate files', error)
    } finally {
      isGeneratingFiles.value = false
    }
  }

  return {
    posts,
    search,
    activePostId,
    activeTab,
    theme,
    mobileView,
    isLoadingPosts,
    isFetchingPosts,
    isGeneratingFiles,
    lastFetchWarning,
    filteredPosts,
    activePost,
    selectPost,
    setTab,
    toggleTheme,
    backToList,
    loadPosts,
    fetchPosts,
    generateFilesForActivePost,
  }
})
