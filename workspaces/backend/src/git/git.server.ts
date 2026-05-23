import { Git } from "node-git-server";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { spawn } from "node:child_process";
import type { AppDataSource } from "@ye-yu/database/data-source";
import { BlogPost } from "@ye-yu/database";
import { PrefixedLogger } from "@ye-yu/shared/logger";
import type { HttpMiddleware } from "../platform/http-router.ts";

const console = new PrefixedLogger(import.meta.url);

// workspaces/backend/src/git -> workspaces/database/data/repositories
export const REPO_ROOT = path.resolve(import.meta.dirname, "../../../database/data/repositories");
export const BARE_ROOT = path.join(REPO_ROOT, ".bare");
export const DEFAULT_BRANCH = "main";

function repoNameFromUrl(repoOrUrl: string): string {
  const last = repoOrUrl.split(/[\\/]/).pop() ?? repoOrUrl;
  return last.replace(/\.git$/, "");
}

function runGit(cwd: string, args: string[]): Promise<void> {
  const start = new Date();
  return new Promise<void>((resolve, reject) => {
    const child = spawn("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (c) => (stderr += c.toString()));
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`git ${args.join(" ")} failed (${code}): ${stderr.trim()}`)),
    );
  }).then(() => {
    const duration = new Date().getTime() - start.getTime();
    console.debug(
      `git ${args.map((e) => (e.includes(" ") ? `"${e}"` : e)).join(" ")} completed in ${duration}ms`,
    );
  });
}

const inFlight = new Map<string, Promise<boolean>>();

let dataSource: typeof AppDataSource;

export function setGitServerDataSource(ds: typeof AppDataSource): void {
  dataSource = ds;
}

async function materializeRepo(repoName: string): Promise<boolean> {
  const existing = inFlight.get(repoName);
  if (existing) return existing;
  const task = (async () => {
    const post = await dataSource
      .getRepository(BlogPost)
      .createQueryBuilder("post")
      .where("post.gitUrl LIKE :pattern", { pattern: `%/git/${repoName}.git` })
      .getOne();
    if (!post) {
      console.warn(`No BlogPost found for git repo '${repoName}'`);
      return false;
    }

    const sourceDir = path.join(REPO_ROOT, repoName);
    if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
      console.warn(`Source content directory not found: ${sourceDir}`);
      return false;
    }

    const bareDir = path.join(BARE_ROOT, `${repoName}.git`);
    fs.rmSync(bareDir, { recursive: true, force: true });
    fs.mkdirSync(bareDir, { recursive: true });
    await runGit(bareDir, ["init", "--bare", "-b", DEFAULT_BRANCH]);

    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `git-srv-${repoName}-`));
    try {
      await runGit(workDir, ["init", "-b", DEFAULT_BRANCH]);
      await runGit(workDir, ["config", "user.email", "git-server@localhost"]);
      await runGit(workDir, ["config", "user.name", "Git Server"]);

      fs.cpSync(sourceDir, workDir, { recursive: true, dereference: true });

      await runGit(workDir, ["add", "."]);
      await runGit(workDir, [
        "commit",
        "--allow-empty",
        "-m",
        `Snapshot of ${post.title || repoName}`,
      ]);
      await runGit(workDir, ["push", "--mirror", bareDir]);
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }

    console.info(`Materialized git repo '${repoName}' from ${sourceDir}`);
    return true;
  })();
  inFlight.set(repoName, task);
  try {
    return await task;
  } finally {
    inFlight.delete(repoName);
  }
}

fs.mkdirSync(REPO_ROOT, { recursive: true });
fs.mkdirSync(BARE_ROOT, { recursive: true });
const repos = new Git((dir) => path.join(BARE_ROOT, `${repoNameFromUrl(dir ?? "")}.git`), {
  autoCreate: false,
});
repos.on("push", (push) => {
  console.warn(`Rejected push to '${push.repo}' (read-only server)`);
  push.reject(403, "This is a read-only git server");
});

repos.on("info", (info) => {
  const repoName = repoNameFromUrl(info.repo);
  materializeRepo(repoName).then(
    (ok) => {
      if (ok) info.accept();
      else info.reject(404, `Repository '${repoName}' not found`);
    },
    (err) => {
      console.error(`Failed to materialize '${repoName}':`, err);
      info.reject(500, "Failed to prepare repository");
    },
  );
});

repos.on("head", (head) => head.accept());

repos.on("fetch", (fetch) => {
  console.info(`Fetch ${fetch.repo} @ ${fetch.commit}`);
  fetch.accept();
});

/**
 * @param repoName must be a valid directory name. e.g. `my-blog-post`
 * @param files a record of file paths to their contents
 */
export async function createRepository(
  repoName: string,
  files: Record<string, string>,
): Promise<void> {
  const repoDir = path.join(REPO_ROOT, repoName);
  if (fs.existsSync(repoDir)) {
    throw new Error(`Repository '${repoName}' already exists`);
  }

  await new Promise<void>((resolve, reject) => {
    repos.create(repoName, (err) => (err ? reject(err) : resolve()));
  });
  const bareDir = path.join(BARE_ROOT, `${repoName}.git`);

  fs.mkdirSync(repoDir, { recursive: true });
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(repoDir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `git-create-${repoName}-`));
  try {
    await runGit(workDir, ["init", "-b", DEFAULT_BRANCH]);
    await runGit(workDir, ["config", "user.email", "git-server@localhost"]);
    await runGit(workDir, ["config", "user.name", "Git Server"]);
    fs.cpSync(repoDir, workDir, { recursive: true, dereference: true });
    await runGit(workDir, ["add", "."]);
    await runGit(workDir, ["commit", "--allow-empty", "-m", `Initial commit for ${repoName}`]);
    await runGit(workDir, ["push", "--mirror", bareDir]);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

export function getGitHandler(): HttpMiddleware {
  const handler = repos.handle.bind(repos);
  return (req, res, _) => handler(req, res);
}
