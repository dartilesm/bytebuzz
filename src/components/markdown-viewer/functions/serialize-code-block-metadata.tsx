/**
 * Serializes metadata object into a JSON string suitable for code block header.
 * Returns a string like '{"key":"value","key2":"value2"}'.
 */
export function serializeCodeBlockMetadata(metadata: Record<string, string>): string {
    return JSON.stringify(metadata);
}
