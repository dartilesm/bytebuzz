/**
 * Parses metadata from a single metadata string
 * Supports both JSON format (new) and key=value format (legacy) for backward compatibility
 */
function parseMetadataString(metadataString: string): Record<string, string> {
    // 1. Try to parse as JSON first (new format)
    try {
        const parsed = JSON.parse(metadataString);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            // Ensure all values are strings (JSON.parse may return numbers, booleans, etc.)
            const result: Record<string, string> = {};
            for (const [key, value] of Object.entries(parsed)) {
                result[key] = String(value);
            }
            return result;
        }
    } catch {
        // JSON parsing failed, fall through to legacy format parsing
    }

    // 2. Fallback: Parse legacy key=value format for backward compatibility
    // Regex to find key="value" or key=value pairs.
    // Handles comma/space separators.
    // (?:^|[\s,]+) -> Matches start or separators (space/comma)
    // ([a-zA-Z0-9_-]+) -> Matches key (alphanumeric + _ + -)
    // = -> Matches equals
    // (?:"([^"]*)"|([^,\s"}]+)) -> Matches quoted value (group 2) or unquoted value (group 3)
    const metadataPairsRegex = /(?:^|[\s,]+)([a-zA-Z0-9_-]+)=(?:"([^"]*)"|([^,\s"}]+))/g;

    const result: Record<string, string> = {};
    let match;

    while ((match = metadataPairsRegex.exec(metadataString)) !== null) {
        const key = match[1];
        // Group 2 is quoted value, Group 3 is unquoted
        const value = match[2] !== undefined ? match[2] : match[3];
        if (key) {
            result[key] = value;
        }
    }

    return result;
}

/**
 * Parses metadata from code blocks in markdown
 * Returns a record of code content to an object of metadatas
 * Supports both JSON format (new) and key=value format (legacy) for backward compatibility
 * 
 * @deprecated Use parseAllCodeBlockMetadata for multiple code blocks
 */
export function parseCodeBlockMetadata(markdown: string): Record<string, string> {
    let metadataString = markdown;

    // 1. Try to extract from code block fence if present
    // Match ```lang metadata...
    // We allow - in language name
    const codeBlockMatch = markdown.match(/^```[a-zA-Z0-9-]*\s+(.+)$/m);
    if (codeBlockMatch) {
        metadataString = codeBlockMatch[1];
    } else {
        // Fallback: if the input contains code block fences but didn't match the regex above
        // (likely because there is no metadata after the language, e.g. ```js),
        // we assume there is no metadata to parse.
        // If the input DOES NOT contain code block fences, we assume the user passed
        // a raw metadata string, so we proceed to parse it.
        if (markdown.includes("```")) {
            return {};
        }
    }

    return parseMetadataString(metadataString);
}

/**
 * Parses metadata from all code blocks in markdown
 * Returns an array of metadata objects in the order they appear in the markdown
 * Each entry contains language, code content, and metadata
 */
export function parseAllCodeBlockMetadata(markdown: string): Array<{
    language: string;
    codeContent: string;
    metadata: Record<string, string>;
}> {
    const codeBlocks: Array<{
        language: string;
        codeContent: string;
        metadata: Record<string, string>;
    }> = [];

    // Match all code blocks: ```lang metadata\ncode\n```
    // We allow - in language name
    // The regex matches: ```lang metadata\ncode\n```
    const codeBlockRegex = /^```([a-zA-Z0-9-]*)\s*([^\n]*)\n([\s\S]*?)\n```$/gm;

    let match;
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
        const language = match[1] || "text";
        const metadataString = match[2]?.trim() || "";
        const codeContent = match[3] || "";

        const metadata = metadataString ? parseMetadataString(metadataString) : {};
        codeBlocks.push({
            language,
            codeContent,
            metadata,
        });
    }

    return codeBlocks;
}
