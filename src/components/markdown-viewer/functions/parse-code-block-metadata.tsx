/**
 * Parses metadata from code blocks in markdown
 * Returns a record of code content to an object of metadatas
 */
export function parseCodeBlockMetadata(markdown: string): Record<string, string> {
    // Match the opening “```xxx some_text key="value",key2=value2 more_text”
    const match = markdown.match(/^```[a-zA-Z0-9]*\s+(.+)$/m);
    if (!match) return {};

    const metadataString = match[1];

    // Regex to find key="value" or key=value pairs.
    // It captures key, and then either a quoted value or an unquoted value.
    const metadataPairsRegex = /([a-zA-Z0-9_]+)=(?:"([^"]*)"|([^,\s]+))/g;
    let metadataMatch;
    const result: Record<string, string> = {};

    while ((metadataMatch = metadataPairsRegex.exec(metadataString)) !== null) {
        const key = metadataMatch[1];
        // Prioritize the quoted value (group 2), otherwise use the unquoted value (group 3)
        const value = metadataMatch[2] !== undefined ? metadataMatch[2] : metadataMatch[3];
        if (key && value !== undefined) {
            result[key] = value;
        }
    }

    return result;
}