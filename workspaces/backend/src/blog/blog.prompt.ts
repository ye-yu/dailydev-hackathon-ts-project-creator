import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { createBareRepositoryIfNotExist, REPO_ROOT } from '../git/git.server.ts'
import type { BlogFileLazy, BlogPostLazy } from '@ye-yu/shared/entities'
import { AppDataSource } from '@ye-yu/database/data-source'
import { BlogPost } from '@ye-yu/database'
import { PrefixedLogger } from '@ye-yu/shared/logger'

const console = new PrefixedLogger(import.meta.url)

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
- MUST generate git directory at ${REPO_ROOT}/{repoName}
- MUST configure git repository with "main" as default branch, user as "blog-generator", and email as "blog-generator@localhost"
- if the repository already exists, check the content and improve the content if needed
- MUST run the following command to publish the generated git repository:

<GIT_COMMAND>
# in ${REPO_ROOT}/{repoName}
git add .
git commit -m "Initial commit"
git push --mirror ${REPO_ROOT}/.bare/{repoName}.git
</GIT_COMMAND

<BLOG_DESCRIPTION>
{description}
</BLOG_DESCRIPTION>

<BLOG_CONTENT>
{content}
</BLOG_CONTENT>
`

async function runCommand(executable: string, args: string[], cwd?: string): Promise<void> {
  const start = new Date()
  await new Promise<void>((resolve, reject) => {
    const child = spawn(executable, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
    child.stdout.on('data', (c) => console.debug(c.toString()))
    let stderr = ''
    child.stderr.on('data', (c) => (stderr += c.toString()))
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${executable} ${args.join(' ')} failed (${code}): ${stderr.trim()}`)),
    )
  })
  const duration = new Date().getTime() - start.getTime()
  console.debug(
    `${executable} ${args.map((e) => (e.includes(' ') ? `"${e}"` : e)).join(' ')} completed in ${duration}ms`,
  )
}

function descriptionToIdentifier(description: string, method = ''): string {
  const prefix = description
    .toLocaleLowerCase('en-us')
    .startsWith(method.toLocaleLowerCase('en-us'))
    ? ''
    : method.charAt(0).toUpperCase() + method.slice(1)
  return (
    prefix +
    description
      .split(/[^\w]+/g)
      .slice(0, 10)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  )
}

export async function generateGitRepoFromBlogContent(blogPost: BlogPostLazy): Promise<void> {
  const { title, description, content } = blogPost
  const repoName = descriptionToIdentifier(title)
  const prompt = BLOG_PROMPT.replace('{description}', description)
    .replace('{content}', content)
    .replace('{repoName}', repoName)
  const promptPath = path.resolve(REPO_ROOT, 'prompts')
  const promptStat = fs.statSync(promptPath, { throwIfNoEntry: false })
  if (!promptStat) {
    fs.mkdirSync(promptPath, { recursive: true })
  } else if (!promptStat.isDirectory()) {
    throw new Error(`Prompt path exists but is not a directory: ${promptPath}`)
  }

  await createBareRepositoryIfNotExist(repoName)
  const promptFilePath = path.join(promptPath, `${repoName}.txt`)
  fs.writeFileSync(promptFilePath, prompt)
  await runCommand('echo', ['saved prompts in', promptFilePath], process.cwd())
  await runCommand('echo', ['running openclaw at', promptPath], process.cwd())
  const openClawCommands = [
    'openclaw',
    'agent',
    '--agent',
    'main',
    '--message',
    `process all .txt prompts at /root/git-items/dailydev-hackathon-ts-project-creator/workspaces/database/data/repositories/prompts and move the file to *.txt.done when finished.`,
  ]
  await runCommand('echo', openClawCommands, process.cwd())
  await runCommand(openClawCommands[0], openClawCommands.slice(1), process.cwd())

  const repoPath = `${REPO_ROOT}/${repoName}`
  console.info(`git repo generated for blog post "${title}" at ${repoPath}`)
  const snippetsDir = path.join(repoPath, 'snippets')
  const files = Array.from(flatten(snippetsDir)).map(
    (file) =>
      ({
        path: file.path,
        language: path.extname(file.path).slice(1),
        content: file.content,
        postId: blogPost.id,
        post: blogPost,
      }) satisfies Omit<BlogFileLazy, 'id'>,
  )
  const blogPostRepo = AppDataSource.getRepository(BlogPost)
  await blogPostRepo.update(blogPost.id, { gitUrl: `/git/${repoName}.git`, files: files })
}

function* flatten(directory: string): Generator<{ path: string; content: string }> {
  const readdirs = fs.readdirSync(directory, { withFileTypes: true })
  for (const dirent of readdirs) {
    const fullPath = path.join(directory, dirent.name)
    if (dirent.isDirectory()) {
      yield* flatten(fullPath)
    } else if (dirent.isFile()) {
      yield { path: fullPath, content: fs.readFileSync(fullPath, 'utf-8') }
    }
  }
}
