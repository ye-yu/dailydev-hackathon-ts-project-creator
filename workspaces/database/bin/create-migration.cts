/* eslint-disable @typescript-eslint/no-require-imports */
import type * as utils from "./utils.cts";
const _utils = require("./utils.cts");
const execOnceAndExit: utils.execOnceAndExit = _utils.execOnceAndExit;
const getPlatformNpm: utils.getPlatformNpm = _utils.getPlatformNpm;
const path: typeof import("path") = require("path");
const fs: typeof import("fs") = require("fs");
const util: typeof import("util") = require("util");

const scriptDir = __dirname;
const dir = path.join(scriptDir, "..", "src", "migrations");
if (!fs.statSync(dir).isDirectory()) {
  console.error(`Expected ${dir} to be a directory`);
  process.exit(1);
}

const { positionals, values } = util.parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

const helpMessage = `Usage: pnpm migration:generate [options] <migration-name>
       node bin/create-migration.cts [options] <migration-name>

Options:
  -h, --help    Show this help message
`;
if (values.help) {
  console.info(helpMessage);
  process.exit(0);
}

console.log("Parsed positionals:", positionals);
if (!positionals.length) {
  console.error("Error: No migration name provided.");
  console.info(helpMessage);
  process.exit(1);
}

if (positionals.length > 1) {
  console.error("Expected only one positional argument");
  console.info(helpMessage);
  process.exit(1);
}

const npmPath = getPlatformNpm();
const migrationName = path.join(dir, positionals[0]);

if (!migrationName) {
  console.error("Migration name is required.");
  process.exit(1);
}

const command = [
  npmPath,
  [
    "exec",
    "typeorm",
    "--",
    "migration:generate",
    "-d",
    path.join(scriptDir, "../build/data-source.js"),
    migrationName,
  ],
] as const;

console.log(`Running command: ${command[0]} ${command[1].join(" ")}`);
execOnceAndExit(command[0], command[1]);
