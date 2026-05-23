import type { BlogPostLazy } from "./entities.ts";

export type GetBlogPostsResponse = {
  posts: BlogPostLazy[];
};

export type FetchBlogPostsResponse = {
  throttled: boolean;
  fetchedCount: number;
  lastFetchedAt: string;
};

export type GenerateBlogFilesPathParams = {
  postId: string;
};
