interface LanguageOption {
  value: string;
  label: string;
  extension: string;
}

/**
 * Utility functions for the CodeBlock Editor component
 */
export const codeBlockEditorFunctions = {
  /**
   * Copy text to clipboard using the Clipboard API
   */
  async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
  },

  /**
   * Download code as a file with appropriate extension based on language
   */
  downloadCode(code: string, language: string): void {
    const extension = this.getLanguageExtension(language);
    const filename = `code.${extension}`;

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  },

  /**
   * Get the number of lines in the code
   */
  getLineCount(code: string): number {
    if (!code.trim()) return 0;
    return code.split("\n").length;
  },

  /**
   * Get list of supported programming languages
   */
  getSupportedLanguages(): LanguageOption[] {
    return [
      { value: "javascript", label: "JavaScript", extension: "js" },
      { value: "typescript", label: "TypeScript", extension: "ts" },
      { value: "jsx", label: "JSX", extension: "jsx" },
      { value: "tsx", label: "TSX", extension: "tsx" },
      { value: "python", label: "Python", extension: "py" },
      { value: "java", label: "Java", extension: "java" },
      { value: "cpp", label: "C++", extension: "cpp" },
      { value: "c", label: "C", extension: "c" },
      { value: "csharp", label: "C#", extension: "cs" },
      { value: "php", label: "PHP", extension: "php" },
      { value: "ruby", label: "Ruby", extension: "rb" },
      { value: "go", label: "Go", extension: "go" },
      { value: "rust", label: "Rust", extension: "rs" },
      { value: "swift", label: "Swift", extension: "swift" },
      { value: "kotlin", label: "Kotlin", extension: "kt" },
      { value: "scala", label: "Scala", extension: "scala" },
      { value: "html", label: "HTML", extension: "html" },
      { value: "css", label: "CSS", extension: "css" },
      { value: "scss", label: "SCSS", extension: "scss" },
      { value: "sass", label: "Sass", extension: "sass" },
      { value: "less", label: "Less", extension: "less" },
      { value: "json", label: "JSON", extension: "json" },
      { value: "xml", label: "XML", extension: "xml" },
      { value: "yaml", label: "YAML", extension: "yaml" },
      { value: "markdown", label: "Markdown", extension: "md" },
      { value: "sql", label: "SQL", extension: "sql" },
      { value: "bash", label: "Bash", extension: "sh" },
      { value: "powershell", label: "PowerShell", extension: "ps1" },
      { value: "dockerfile", label: "Dockerfile", extension: "dockerfile" },
      { value: "nginx", label: "Nginx", extension: "conf" },
      { value: "apache", label: "Apache", extension: "conf" },
    ];
  },

  getLanguageExtension(language: string): string {
    const languageOption = this.getSupportedLanguages().find((lang) => lang.value === language);
    return languageOption?.extension || "txt";
  },

  /**
   * Format code with basic indentation (simple formatter)
   */
  formatCode(code: string, language: string): string {
    // Basic formatting for common languages
    if (language === "json") {
      try {
        return JSON.stringify(JSON.parse(code), null, 2);
      } catch {
        return code;
      }
    }

    // For other languages, return as-is (could be extended with more formatters)
    return code;
  },

  /**
   * Validate if the code has basic syntax correctness for certain languages
   */
  validateCode(code: string, language: string): { isValid: boolean; error?: string } {
    if (language === "json") {
      try {
        JSON.parse(code);
        return { isValid: true };
      } catch (error) {
        return {
          isValid: false,
          error: error instanceof Error ? error.message : "Invalid JSON syntax",
        };
      }
    }

    // For other languages, assume valid (could be extended with more validators)
    return { isValid: true };
  },

  /**
   * Get Monaco Editor language mapping
   */
  getMonacoLanguage(lang: string): string {
    const languageMap: Record<string, string> = {
      javascript: "javascript",
      typescript: "typescript",
      jsx: "javascript", // Monaco treats JSX as JavaScript with JSX enabled
      tsx: "typescript", // Monaco treats TSX as TypeScript with JSX enabled
      python: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      csharp: "csharp",
      php: "php",
      ruby: "ruby",
      go: "go",
      rust: "rust",
      swift: "swift",
      kotlin: "kotlin",
      scala: "scala",
      html: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      less: "less",
      json: "json",
      xml: "xml",
      yaml: "yaml",
      markdown: "markdown",
      sql: "sql",
      bash: "shell",
      powershell: "powershell",
      dockerfile: "dockerfile",
    };

    return languageMap[lang] || "plaintext";
  },

  /**
   * Calculate dynamic height based on content and constraints
   */
  calculateDynamicHeight(code: string, maxHeightProp: string): string {
    const lineCount = this.getLineCount(code);
    const minHeight = 150; // Minimum height in pixels
    const maxHeight = Number.parseInt(maxHeightProp.replace("px", ""), 10) || 400; // Use provided height as max
    const lineHeight = 24; // Approximate line height in pixels

    const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, lineCount * lineHeight + 40));
    return `${calculatedHeight}px`;
  },

  /**
   * Check if character count is approaching or at limit
   */
  getCharacterLimitStatus(
    code: string,
    limit: number,
  ): {
    isApproachingLimit: boolean;
    isAtLimit: boolean;
    percentage: number;
  } {
    const percentage = (code.length / limit) * 100;
    return {
      isApproachingLimit: percentage >= 90,
      isAtLimit: code.length >= limit,
      percentage: Math.round(percentage),
    };
  },

  /**
   * Enforce character limit on code input
   */
  enforceCharacterLimit(code: string, limit: number): string {
    return code.length > limit ? code.substring(0, limit) : code;
  },
};
