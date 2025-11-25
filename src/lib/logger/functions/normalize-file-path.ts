
/**
 * Gets the project root directory
 * @returns {string} Project root path
 */
function getProjectRoot(): string {
  return process.env.PWD || "";
}

/**
 * Extracts source file hint from Next.js bundled filename
 * Handles multiple patterns:
 * - `src_6da6ea94._.js` -> `src`
 * - `[root-of-the-server]__87177e6b._.js` -> `[root-of-the-server]` or try to map to source
 * @param {string} filename - Bundled filename
 * @returns {string | null} Source hint or null if not found
 */
function extractSourceHint(filename: string): string | null {
  // Pattern 1: [something]__hash._.js (e.g., [root-of-the-server]__87177e6b._.js)
  const bracketMatch = filename.match(/^\[([^\]]+)\]__[a-f0-9]+\._\.js$/);
  if (bracketMatch) {
    const hint = bracketMatch[1];
    // Try to map common Next.js route patterns to source paths
    if (hint.includes("root")) {
      return "src/app";
    }
    if (hint.includes("page")) {
      return "src/app";
    }
    if (hint.includes("layout")) {
      return "src/app";
    }
    // Return the hint as-is if no mapping found
    return `src/app/${hint}`;
  }

  // Pattern 2: prefix_hash._.js (e.g., src_6da6ea94._.js)
  const prefixMatch = filename.match(/^([a-zA-Z0-9_-]+)_[a-f0-9]+\._\.js$/);
  if (prefixMatch) {
    return prefixMatch[1];
  }

  return null;
}

/**
 * Normalizes a file path to be relative to project root
 * Handles Next.js build paths and converts absolute paths to relative
 * @param {string} filePath - File path to normalize
 * @returns {string} Normalized relative file path
 */
export function normalizeFilePath(filePath: string): string {
  const projectRoot = getProjectRoot();

  if (!projectRoot) {
    return filePath;
  }

  // Handle Next.js bundled paths
  const nextBuildPattern = /\.next\/dev\/server\/chunks\/ssr\/(.+)$/;
  const nextBuildMatch = filePath.match(nextBuildPattern);

  if (nextBuildMatch) {
    const bundledFile = nextBuildMatch[1];
    const sourceHint = extractSourceHint(bundledFile);

    if (sourceHint) {
      // Return a cleaner path hint instead of the full .next path
      return `${sourceHint}/[bundled]`;
    }

    // Fallback: show relative path from project root
    if (filePath.startsWith(projectRoot)) {
      return filePath.slice(projectRoot.length).replace(/^[/\\]/, "");
    }
    return bundledFile;
  }

  // Convert absolute paths to relative
  if (filePath.startsWith(projectRoot)) {
    return filePath.slice(projectRoot.length).replace(/^[/\\]/, "");
  }

  return filePath;
}
