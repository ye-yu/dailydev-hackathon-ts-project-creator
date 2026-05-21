/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn, execSync }: typeof import("child_process") = require("child_process");

function execOnceAndExit(exe: string, args: readonly string[]) {
  console.log(`Attempting to execute: ${exe}`);
  console.log(`With arguments: ${args.join(" ")}`);

  if (process.execve)
    try {
      process.execve(exe, args, process.env);
      return;
    } catch (error: unknown) {
      if (!error) throw new Error("Unknown error");
      if (typeof error !== "object") throw error;
      if (!("code" in error)) throw error;
      if (error.code !== "ERR_FEATURE_UNAVAILABLE_ON_PLATFORM") throw error;
      // ignored
    }

  const child = spawn(exe, args, {
    stdio: "inherit",
    env: process.env,
    shell: true, // Use shell to handle commands like npm.cmd
  });

  child.on("error", (err) => {
    console.error(`Spawn error: ${err.message}`);
  });

  child.on("exit", function (code: number | null, signal: NodeJS.Signals | null) {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
}

function getPlatformNpm() {
  const npmPath = process.platform === "win32" ? "npm.cmd" : "npm";

  try {
    // Check if npm is available in PATH
    const npmVersion = execSync(`${npmPath} --version`, { stdio: "pipe" }).toString().trim();
    console.log(`Found npm version: ${npmVersion}`);
    return npmPath;
  } catch {
    throw new Error(`npm not found in PATH. Ensure npm is installed and available.`);
  }
}

module.exports = {
  execOnceAndExit,
  getPlatformNpm,
};

export type execOnceAndExit = typeof execOnceAndExit;
export type getPlatformNpm = typeof getPlatformNpm;
