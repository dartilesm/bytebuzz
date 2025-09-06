import { describe, it, expect } from "vitest";
import { extractPlainTextFromMarkdown } from "../markdown-text-extractor";

describe("extractPlainTextFromMarkdown", () => {
  it("should remove all markdown syntax and return clean text", () => {
    const markdown =
      "## Check this out!\n\nHere's some **bold text** and `inline code`.\n\n```javascript\nconst hello = 'world';\n```\n\n![Image](https://example.com/image.jpg)\n\n[Link text](https://example.com)";

    const result = extractPlainTextFromMarkdown(markdown);

    expect(result).toBe("Check this out! Here's some bold text and inline code. Link text");
    expect(result).not.toContain("```");
    expect(result).not.toContain("**");
    expect(result).not.toContain("`");
    expect(result).not.toContain("![");
    expect(result).not.toContain("##");
  });

  it("should handle empty or null content", () => {
    expect(extractPlainTextFromMarkdown("")).toBe("");
    expect(extractPlainTextFromMarkdown(null as any)).toBe("");
    expect(extractPlainTextFromMarkdown(undefined as any)).toBe("");
  });

  it("should preserve regular text content", () => {
    const markdown = "This is just regular text with no markdown.";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("This is just regular text with no markdown.");
  });

  it("should remove code blocks completely", () => {
    const markdown =
      "Here's some code:\n\n```typescript\ninterface User {\n  name: string;\n}\n```\n\nAnd some more text.";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("Here's some code: And some more text.");
    expect(result).not.toContain("```");
    expect(result).not.toContain("interface User");
  });

  it("should remove inline code but preserve text", () => {
    const markdown = "Use the `useState` hook for state management.";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("Use the useState hook for state management.");
  });

  it("should remove images completely", () => {
    const markdown =
      "Check out this image:\n\n![Screenshot](https://example.com/screenshot.png)\n\nPretty cool, right?";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("Check out this image: Pretty cool, right?");
    expect(result).not.toContain("![");
    expect(result).not.toContain("Screenshot");
  });

  it("should convert links to plain text", () => {
    const markdown = "Visit [GitHub](https://github.com) for more info.";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("Visit GitHub for more info.");
  });

  it("should remove bold and italic formatting", () => {
    const markdown = "This is **bold** and this is *italic* text.";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("This is bold and this is italic text.");
  });

  it("should remove headers but keep the text", () => {
    const markdown = "# Main Title\n\n## Subtitle\n\n### Section\n\nRegular text here.";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("Main Title Subtitle Section Regular text here.");
  });

  it("should remove blockquotes but keep the text", () => {
    const markdown =
      "Here's a quote:\n\n> This is a blockquote\n> with multiple lines\n\nAnd some regular text.";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe(
      "Here's a quote: This is a blockquote with multiple lines And some regular text.",
    );
  });

  it("should remove list markers but keep the text", () => {
    const markdown =
      "Shopping list:\n\n- Apples\n- Bananas\n- Oranges\n\n1. First item\n2. Second item\n3. Third item";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("Shopping list: Apples Bananas Oranges First item Second item Third item");
  });

  it("should remove horizontal rules", () => {
    const markdown = "First section\n\n---\n\nSecond section\n\n***\n\nThird section";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("First section Second section Third section");
  });

  it("should clean up multiple whitespace and newlines", () => {
    const markdown = "Text   with    multiple\n\n\n\nspaces   and\n\nnewlines.";
    const result = extractPlainTextFromMarkdown(markdown);
    expect(result).toBe("Text with multiple spaces and newlines.");
  });

  it("should handle complex markdown with multiple elements", () => {
    const markdown = `# Project Setup

## Installation

Run the following command:

\`\`\`bash
npm install
\`\`\`

## Features

- **Fast** performance
- *Easy* to use
- \`TypeScript\` support

> This is a great project!

Check out the [documentation](https://docs.example.com) for more info.

![Project Logo](https://example.com/logo.png)`;

    const result = extractPlainTextFromMarkdown(markdown);

    expect(result).toBe(
      "Project Setup Installation Run the following command: Features Fast performance Easy to use TypeScript support This is a great project! Check out the documentation for more info.",
    );
    expect(result).not.toContain("```");
    expect(result).not.toContain("**");
    expect(result).not.toContain("*");
    expect(result).not.toContain("`");
    expect(result).not.toContain("![");
    expect(result).not.toContain("#");
    expect(result).not.toContain(">");
    expect(result).not.toContain("-");
  });
});
