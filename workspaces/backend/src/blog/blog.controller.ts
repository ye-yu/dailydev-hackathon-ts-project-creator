import type { FetchBlogPostsResponse, GetBlogPostsResponse } from '@ye-yu/shared/blog-api'
import { HttpResponse } from '../platform/http-response.ts'
import type { HttpMiddleware } from '../platform/http-router.ts'
import {
  fetchAndCachePostsFromDailyDev,
  generateBlogFiles,
  listCachedBlogPosts,
  loadBlogContent,
} from './blog.service.ts'

export const getBlogPosts: HttpMiddleware = async (_, __, next) => {
  const posts = await listCachedBlogPosts()
  const response: GetBlogPostsResponse = { posts }
  next(HttpResponse.ok(response))
}

export const fetchBlogPosts: HttpMiddleware = async (_, __, next) => {
  const result = await fetchAndCachePostsFromDailyDev()
  const response: FetchBlogPostsResponse = {
    throttled: result.throttled,
    fetchedCount: result.fetchedCount,
    lastFetchedAt: result.lastFetchedAt,
  }

  next(HttpResponse.ok(response))
}

export const generateFilesForBlogPost: HttpMiddleware = async (req, __, next) => {
  const postId = req.params?.postId
  if (!postId) {
    next(new HttpResponse(400, { message: 'Missing postId' }))
    return
  }

  await generateBlogFiles(postId)
  next(HttpResponse.ok())
}

export const loadBlogContentByPostId: HttpMiddleware = async (req, __, next) => {
  const postId = req.params?.postId
  if (!postId) {
    next(new HttpResponse(400, { message: 'Missing postId' }))
    return
  }

  const content = await loadBlogContent(postId)
  if (content === null) {
    next(new HttpResponse(404, { message: 'Post not found or content unavailable' }))
    return
  }

  next(HttpResponse.ok(content))
}
