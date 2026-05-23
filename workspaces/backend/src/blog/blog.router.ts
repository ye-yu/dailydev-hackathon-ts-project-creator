import { router } from "../router.ts";
import { fetchBlogPosts, generateFilesForBlogPost, getBlogPosts } from "./blog.controller.ts";

router.get("/api/blog-posts", getBlogPosts);
router.post("/api/blog-posts/fetch", fetchBlogPosts);
router.post("/api/blog-posts/:postId/generate-files", generateFilesForBlogPost);
