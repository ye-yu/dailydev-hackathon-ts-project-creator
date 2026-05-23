import { after, before, describe, it } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { spawn } from "node:child_process";
import { TestDataSource } from "@ye-yu/database/test-data-source";
import { BlogPost } from "@ye-yu/database";
import {
  createRepository,
  setGitServerDataSource,
  REPO_ROOT,
  BARE_ROOT,
} from "../src/git/git.server.ts";
import { PrefixedLogger } from "../src/logger/logger.ts";
import { startAPIServer } from "../src/server.ts";

const PORT = 7099;
const REPO_NAME = `test-repo-${Date.now()}`;
const GIT_URL = `http://localhost:${PORT}/git/${REPO_NAME}.git`;

const console = new PrefixedLogger(import.meta.url);
let cloneRoot: string | undefined;

function run(
  cwd: string,
  cmd: string,
  args: string[],
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (c) => (stdout += c.toString()));
    child.stderr.on("data", (c) => (stderr += c.toString()));
    child.on("error", reject);
    child.on("exit", (code) => resolve({ stdout, stderr, code }));
  });
}

if (!TestDataSource.isInitialized) {
  await TestDataSource.initialize();
  console.debug("TestDataSource initialized for git server tests");
}

setGitServerDataSource(TestDataSource);
const server = await startAPIServer(PORT);

describe("Git Server", () => {
  before(async () => {
    const blogRepo = TestDataSource.getRepository(BlogPost);
    await blogRepo.save(
      blogRepo.create({
        id: REPO_NAME,
        title: `Test repo ${REPO_NAME}`,
        timestamp: new Date().toISOString(),
        author: "test",
        tags: ["test"],
        description: "test",
        content: "",
        gitUrl: GIT_URL,
        dailyDevUrl: "",
        externalUrl: "",
      }),
    );
  });

  it("creates a repository on disk", async () => {
    await createRepository(REPO_NAME, {
      "README.md": "# Hello\n",
      "src/index.ts": "console.log('hi');\n",
    });
    assert.ok(fs.existsSync(REPO_ROOT), `Source dir ${REPO_ROOT} should exist`);
    assert.ok(fs.existsSync(BARE_ROOT), `Bare repo ${BARE_ROOT} should exist`);
  });

  it("clones the repository via the git server", async () => {
    cloneRoot = fs.mkdtempSync(path.join(os.tmpdir(), `git-srv-test-clone-`));
    const result = await run(cloneRoot, "git", ["clone", GIT_URL, "repo"]);
    assert.strictEqual(result.code, 0, `git clone should succeed. stderr:\n${result.stderr}`);

    const readme = path.join(cloneRoot, "repo", "README.md");
    assert.ok(fs.existsSync(readme), "README.md should exist in clone");
    assert.strictEqual(fs.readFileSync(readme, "utf-8"), "# Hello\n");

    const index = path.join(cloneRoot, "repo", "src", "index.ts");
    assert.ok(fs.existsSync(index), "src/index.ts should exist in clone");
    assert.strictEqual(fs.readFileSync(index, "utf-8"), "console.log('hi');\n");
  });

  it("rejects pushes (read-only)", async () => {
    assert.ok(cloneRoot, "clone must have happened");
    const repoDir = path.join(cloneRoot!, "repo");
    await run(repoDir, "git", ["config", "user.email", "test@test"]);
    await run(repoDir, "git", ["config", "user.name", "test"]);
    fs.writeFileSync(path.join(repoDir, "new.txt"), "x");
    await run(repoDir, "git", ["add", "."]);
    await run(repoDir, "git", ["commit", "-m", "x"]);
    const result = await run(repoDir, "git", ["push", "origin", "main"]);
    assert.notStrictEqual(result.code, 0, "push should be rejected");
  });

  after(async () => {
    if (cloneRoot) {
      fs.rmSync(cloneRoot, { recursive: true, force: true });
    }

    for (const testRepos of fs
      .readdirSync(REPO_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith("test-repo-"))) {
      console.info(`Cleaning up test repo: ${testRepos.name}`);
      fs.rmSync(path.join(REPO_ROOT, testRepos.name), { recursive: true, force: true });
    }

    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }

    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  });
});
