/**
 * Helper functions for CodeBlock component
 */

/**
 * Gets file extension based on language
 */
export function getFileExtension(lang: string): string {
  const extensionMap: Record<string, string> = {
    javascript: "js",
    js: "js",
    typescript: "ts",
    ts: "ts",
    jsx: "jsx",
    tsx: "tsx",
    html: "html",
    css: "css",
    scss: "scss",
    python: "py",
    py: "py",
    ruby: "rb",
    rb: "rb",
    go: "go",
    rust: "rs",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "cs",
    php: "php",
    swift: "swift",
    kotlin: "kt",
    shell: "sh",
    bash: "sh",
    json: "json",
    yaml: "yml",
    yml: "yml",
    markdown: "md",
    md: "md",
    sql: "sql",
  };

  return extensionMap[lang.toLowerCase()] || "txt";
}

/**
 * Formats language display name for UI
 */
export function formatLanguage(lang: string): string {
  const languageMap: Record<string, string> = {
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    py: "Python",
    python: "Python",
    rb: "Ruby",
    go: "Go",
    rust: "Rust",
    java: "Java",
    c: "C",
    cpp: "C++",
    cs: "C#",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    shell: "Shell",
    bash: "Bash",
    json: "JSON",
    yaml: "YAML",
    md: "Markdown",
    sql: "SQL",
  };

  return languageMap[lang.toLowerCase()] || lang;
}

/**
 * Adds line numbers to highlighted HTML
 */
export function addLineNumbers(
  html: string,
  showLineNumbers: boolean,
  hideSymbol: boolean,
): string {
  if (!showLineNumbers || hideSymbol) {
    return html;
  }

  // Extract the content between <pre> and </pre> tags
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (!preMatch) return html;

  const codeContent = preMatch[1];
  const lines = codeContent.split("\n");
  const paddingWidth = lines.length.toString().length;

  const linesWithNumbers = lines
    .map((line: string, index: number) => {
      const lineNumber = (index + 1).toString().padStart(paddingWidth, " ");
      return `<span class="code-line-number text-muted-foreground/40 select-none mr-4 text-right inline-block min-w-[2ch]">${lineNumber}</span>${line}`;
    })
    .join("\n");

  return html.replace(preMatch[1], linesWithNumbers);
}
