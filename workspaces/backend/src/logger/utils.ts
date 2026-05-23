import { createRequire } from "node:module";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const toFileURL = (path: string) =>
  path.startsWith("file://") ? path : pathToFileURL(path).href;

export const toPath = (url: string) => (url.startsWith("file://") ? fileURLToPath(url) : url);

export function removeSearchParams(url: string) {
  return url.split("?")[0] ?? url;
}

export function isDependencyPackage(specifier: string, parent?: string) {
  const parentURL = parent
    ? parent.startsWith("file://")
      ? parent
      : pathToFileURL(parent).href
    : import.meta.url;

  const resolved = createRequire(parentURL).resolve(specifier);
  return resolved.includes("node_modules");
}

const cwd = process.cwd();
export function removeCwdFromUrl(url: string) {
  try {
    const filePath = toPath(url);
    const relativePath = path.relative(cwd, filePath);
    return relativePath.startsWith("..") ? url : relativePath;
    // oxlint-disable-next-line no-unused-vars
  } catch (_: unknown) {
    return url;
  }
}
