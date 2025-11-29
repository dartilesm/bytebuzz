/**
 * Parses metadata from code blocks in markdown
 * Accepts either a full code block fence (```lang {...}) or just the JSON stringified metadata
 * Supports both JSON format (new) and key=value format (legacy) for backward compatibility
 * 
 * @param input - Either a code block fence string (```lang {...}) or a JSON stringified object ({...})
 * @returns Record of metadata key-value pairs (all values are strings)
 */
export function parseCodeBlockMetadata(input: string): Record<string, string> {
    if (!input || !input.trim()) {
        return {};
    }

    let metadataString = input.trim();

    // 1. Check if input is a code block fence (starts with ```)
    if (metadataString.startsWith("```")) {
        // Match ```lang metadata...
        // We allow - in language name
        const codeBlockMatch = metadataString.match(/^```[a-zA-Z0-9-]*\s+(.+)$/m);
        if (codeBlockMatch) {
            metadataString = codeBlockMatch[1].trim();
        } else {
            // Code block fence found but no metadata after language (e.g., ```js)
            return {};
        }
    }

    // 2. Try to parse as JSON first (new format)
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

    // 3. Fallback: Parse legacy key=value format for backward compatibility
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
