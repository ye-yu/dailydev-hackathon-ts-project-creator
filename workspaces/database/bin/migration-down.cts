/* eslint-disable @typescript-eslint/no-require-imports */
import type * as utils from "./utils.cts";
const _utils = require("./utils.cts");
const execOnceAndExit: utils.execOnceAndExit = _utils.execOnceAndExit;
const getPlatformNpm: utils.getPlatformNpm = _utils.getPlatformNpm;
const path: typeof import("path") = require("path");
const util: typeof import("util") = require("util");

const { values } = util.parseArgs({
  args: process.argv.slice(2),
  allowPositionals: false,
  options: {
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

const helpMessage = `Usage: pnpm migration:down [options]
       node bin/migration-down.cts [options]

Options:
  -h, --help    Show this help message
`;

if (values.help) {
  console.info(helpMessage);
  process.exit(0);
}

const command = [
  getPlatformNpm(),
  [
    "exec",
    "typeorm",
    "--",
    "migration:revert",
    "-d",
    path.join(__dirname, "../build/data-source.js"),
  ],
] as const;

execOnceAndExit(command[0], command[1]);
