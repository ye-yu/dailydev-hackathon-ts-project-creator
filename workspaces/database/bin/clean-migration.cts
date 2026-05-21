/* eslint-disable @typescript-eslint/no-require-imports */
const path: typeof import("path") = require("path");
const fs: typeof import("fs") = require("fs");
const util: typeof import("util") = require("util");

type CliValues = {
  help?: boolean;
  "dry-run"?: boolean;
};

const { values } = util.parseArgs({
  args: process.argv.slice(2),
  allowPositionals: false,
  options: {
    help: {
      type: "boolean",
      short: "h",
    },
    "dry-run": {
      type: "boolean",
      short: "d",
    },
  },
}) as { values: CliValues };

const helpMessage = `Usage: pnpm migration:clean [options]
			 node bin/clean-migration.cts [options]

Options:
	-h, --help      Show this help message
	-d, --dry-run   Print files that would be removed, without deleting
`;

if (values.help) {
  console.info(helpMessage);
  process.exit(0);
}

const buildMigrationsDir = path.join(__dirname, "..", "build", "migrations");
const srcMigrationsDir = path.join(__dirname, "..", "src", "migrations");
const dryRun = Boolean(values["dry-run"]);

if (!fs.existsSync(srcMigrationsDir) || !fs.statSync(srcMigrationsDir).isDirectory()) {
  console.error(`Expected ${srcMigrationsDir} to be a directory`);
  process.exit(1);
}

if (!fs.existsSync(buildMigrationsDir) || !fs.statSync(buildMigrationsDir).isDirectory()) {
  console.error(`Expected ${buildMigrationsDir} to be a directory`);
  process.exit(1);
}

function walkFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absPath));
    } else if (entry.isFile()) {
      files.push(absPath);
    }
  }
  return files;
}

function toRelativeWithoutExt(fileAbsPath: string, rootDir: string): string {
  const rel = path.relative(rootDir, fileAbsPath);
  const ext = path.extname(rel);
  return rel.slice(0, rel.length - ext.length).replace(/\\/g, "/");
}

const srcMigrationIds = new Set(
  walkFiles(srcMigrationsDir)
    .filter((filePath) => filePath.endsWith(".ts"))
    .map((filePath) => toRelativeWithoutExt(filePath, srcMigrationsDir)),
);

const staleBuildJsFiles = walkFiles(buildMigrationsDir).filter((filePath) => {
  if (!filePath.endsWith(".js")) {
    return false;
  }
  const id = toRelativeWithoutExt(filePath, buildMigrationsDir);
  return !srcMigrationIds.has(id);
});

const filesToRemove = staleBuildJsFiles.flatMap((jsFilePath) => {
  const mapFilePath = `${jsFilePath}.map`;
  if (fs.existsSync(mapFilePath) && fs.statSync(mapFilePath).isFile()) {
    return [jsFilePath, mapFilePath];
  }
  return [jsFilePath];
});

if (!filesToRemove.length) {
  console.info("No stale built migrations found.");
  process.exit(0);
}

if (dryRun) {
  console.info("Dry run: would remove the following files:");
  for (const filePath of filesToRemove) {
    console.info(`- ${filePath}`);
  }
  process.exit(0);
}

for (const filePath of filesToRemove) {
  fs.unlinkSync(filePath);
  console.info(`Removed ${filePath}`);
}

console.info(`Cleanup complete. Removed ${filesToRemove.length} file(s).`);
