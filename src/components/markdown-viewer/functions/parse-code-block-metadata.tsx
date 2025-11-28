/**
 * Parses metadata from code blocks in markdown
 * Returns a record of code content to an object of metadatas
 */
export function parseCodeBlockMetadata(markdown: string): Record<string, string> {
    // Match the opening “```xxx key=value,key2=value2”
    const match = markdown.match(/^```[a-zA-Z0-9]*\s+(.+)$/m);
    if (!match) return {};

    const metadataString = match[1];

    return metadataString.split(",").reduce((acc, pair) => {
        const [key, value] = pair.split("=").map(s => s.trim());
        if (!key) return acc;

        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);
}