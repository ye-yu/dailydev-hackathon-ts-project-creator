import { spawn } from "node:child_process"
import { REPO_ROOT } from "../git/git.server.ts"
import type { BlogPostLazy } from "@ye-yu/shared/entities"
import { AppDataSource } from "@ye-yu/database/data-source"
import { BlogPost } from "@ye-yu/database"

export const BLOG_PROMPT = `
// TODO: improve prompt

Generate working git directory with initial codebase based on the blog content passed after the tag <BLOG_CONTENT> and before </BLOG_CONTENT>.
- MUST include README on how to setup and run the codebase
- NEVER try to run the setup or installation commands, just generate the git directory with codebase
- MUST include .gitignore file with appropriate content for the codebase
- NEVER include node_modules or any other dependencies in the generated git directory
- may include "tests" directory with test files if appropriate for the blog content
- MUST include "src" directory with source code files if appropriate for the blog content
- MUST include "snippets" directory to show sample code snippets, it may not need to be runnable code
- "snippets" directory may be nested with subdirectories matching actual "src" structure
- MUST generate git directory at ${REPO_ROOT}
- MUST configure git repository with "main" as default branch, user as "blog-generator", and email as "blog-generator@localhost"

<BLOG_CONTENT>
{content}
</BLOG_CONTENT>
`

async function runCommand(executable: string, args: string[], cwd?: string): Promise<void> {
    const start = new Date()
    await new Promise<void>((resolve, reject) => {
    const child = spawn(executable, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''
    child.stderr.on('data', (c) => (stderr += c.toString()))
    child.on('error', reject)
    child.on('exit', (code) => code === 0
      ? resolve()
      : reject(new Error(`${executable} ${args.join(' ')} failed (${code}): ${stderr.trim()}`)))
  })
  const duration = new Date().getTime() - start.getTime()
  console.debug(
    `${executable} ${args.map((e) => (e.includes(' ') ? `"${e}"` : e)).join(' ')} completed in ${duration}ms`)
}

export async function generateGitRepoFromBlogContent(content: string, blogPost: BlogPostLazy): Promise<void> {
  const prompt = BLOG_PROMPT.replace('{content}', content)
  await runCommand("echo", ["testing prompt", prompt], process.cwd())
  // TODO: search through the new git repo, scan for "snippets" directory, and extract code snippets and save to
  const blogPostRepo= AppDataSource.getRepository(BlogPost)
  await blogPostRepo.update(blogPost.id, { gitUrl: "", files: [] })
}
