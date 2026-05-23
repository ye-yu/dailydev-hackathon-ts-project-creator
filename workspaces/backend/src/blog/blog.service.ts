import type { BlogPostLazy } from "@ye-yu/shared/entities";
import { createDailyDevRequestInit } from "@ye-yu/shared/daily-dev";
import { AppDataSource } from "@ye-yu/database/data-source";
import { PrefixedLogger } from "../logger/logger.ts";
import { BlogPost, DailyDevFetchState } from "@ye-yu/database";
import type { FeedPost } from "@ye-yu/shared/daily-dev-schema";

const console = new PrefixedLogger(import.meta.url);
const FETCH_STATE_KEY = "daily-dev-posts";
const FETCH_THROTTLE_MS = 10 * 60 * 1000;

type FetchPostsResult = {
  throttled: boolean;
  fetchedCount: number;
  lastFetchedAt: string;
};

function mapDailyDevPostToBlogPost(post: FeedPost) {
  return {
    id: post.id,
    title: post.title,
    timestamp: post.publishedAt ?? post.createdAt,
    author: post.author?.name || "Unknown",
    tags: post.tags,
    description: post.summary ?? "",
    content: "",
    gitUrl: "",
    dailyDevUrl: post.commentsPermalink,
    externalUrl: post.url,
  };
}

export async function listCachedBlogPosts(): Promise<BlogPostLazy[]> {
  const blogPostRepository = AppDataSource.getRepository(BlogPost);
  const posts = await blogPostRepository.find({
    relations: { files: true },
    order: { timestamp: "DESC" },
  });

  return posts;
}

export async function fetchAndCachePostsFromDailyDev(): Promise<FetchPostsResult> {
  const stateRepository = AppDataSource.getRepository(DailyDevFetchState);
  const existingState = await stateRepository.findOne({
    where: { key: FETCH_STATE_KEY },
  });

  const now = Date.now();
  if (existingState) {
    const elapsedMs = now - Date.parse(existingState.lastFetchedAt);
    if (Number.isFinite(elapsedMs) && elapsedMs < FETCH_THROTTLE_MS) {
      console.warn(
        `Ignoring fetch request: called again within ${Math.floor(FETCH_THROTTLE_MS / 60000)} minutes.`,
      );
      return {
        throttled: true,
        fetchedCount: 0,
        lastFetchedAt: existingState.lastFetchedAt,
      };
    }
  }

  const { url, ...request } = createDailyDevRequestInit("GetPersonalizedForYouFeed", "get", {
    searchParams: {
      limit: 25,
      cursor: "",
    },
  });

  const result = await fetch(url, request, true);
  switch (result.status) {
    case 200: {
      const response = await result.json();
      const mappedPosts = response.data.map(mapDailyDevPostToBlogPost);
      const blogPostRepository = AppDataSource.getRepository(BlogPost);

      await blogPostRepository.upsert(mappedPosts, ["id"]);

      const latestFetchAt = new Date(now).toISOString();
      await stateRepository.upsert(
        {
          key: FETCH_STATE_KEY,
          lastFetchedAt: latestFetchAt,
        },
        ["key"],
      );

      return {
        throttled: false,
        fetchedCount: mappedPosts.length,
        lastFetchedAt: latestFetchAt,
      };
    }
    default:
      console.warn(`Daily.dev fetch failed with status ${result.status}`);
      return {
        throttled: false,
        fetchedCount: 0,
        lastFetchedAt: existingState?.lastFetchedAt ?? new Date(now).toISOString(),
      };
  }
}

export async function generateBlogFiles(postId: string): Promise<void> {
  console.info(`Generate files requested for post: ${postId}`);
}
