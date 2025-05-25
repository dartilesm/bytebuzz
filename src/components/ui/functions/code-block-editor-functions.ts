interface LanguageOption {
  value: string;
  label: string;
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
    const fileExtensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      csharp: "cs",
      php: "php",
      ruby: "rb",
      go: "go",
      rust: "rs",
      swift: "swift",
      kotlin: "kt",
      scala: "scala",
      html: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      less: "less",
      json: "json",
      xml: "xml",
      yaml: "yml",
      markdown: "md",
      sql: "sql",
      bash: "sh",
      powershell: "ps1",
      dockerfile: "dockerfile",
      nginx: "conf",
      apache: "conf",
    };

    const extension = fileExtensions[language] || "txt";
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
      { value: "javascript", label: "JavaScript" },
      { value: "typescript", label: "TypeScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "cpp", label: "C++" },
      { value: "c", label: "C" },
      { value: "csharp", label: "C#" },
      { value: "php", label: "PHP" },
      { value: "ruby", label: "Ruby" },
      { value: "go", label: "Go" },
      { value: "rust", label: "Rust" },
      { value: "swift", label: "Swift" },
      { value: "kotlin", label: "Kotlin" },
      { value: "scala", label: "Scala" },
      { value: "html", label: "HTML" },
      { value: "css", label: "CSS" },
      { value: "scss", label: "SCSS" },
      { value: "sass", label: "Sass" },
      { value: "less", label: "Less" },
      { value: "json", label: "JSON" },
      { value: "xml", label: "XML" },
      { value: "yaml", label: "YAML" },
      { value: "markdown", label: "Markdown" },
      { value: "sql", label: "SQL" },
      { value: "bash", label: "Bash" },
      { value: "powershell", label: "PowerShell" },
      { value: "dockerfile", label: "Dockerfile" },
      { value: "nginx", label: "Nginx" },
      { value: "apache", label: "Apache" },
    ];
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
};
