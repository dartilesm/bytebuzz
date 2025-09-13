/**
 * Utility functions for handling expandable content in posts
 */

/**
 * Splits markdown content into logical blocks for progressive expansion
 * @param content - The markdown content to split
 * @returns Array of content blocks
 */
export function splitContentIntoBlocks(content: string): string[] {
  if (!content.trim()) return [];

  // Split by double newlines (paragraph breaks) and code blocks
  const blocks: string[] = [];
  const lines = content.split("\n");
  let currentBlock = "";
  let inCodeBlock = false;
  let codeBlockFence = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for code block start/end
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        // Starting a code block
        if (currentBlock.trim()) {
          blocks.push(currentBlock.trim());
          currentBlock = "";
        }
        inCodeBlock = true;
        codeBlockFence = line.trim();
        currentBlock += `${line}\n`;
      } else if (line.trim() === codeBlockFence.split(" ")[0]) {
        // Ending a code block
        currentBlock += `${line}\n`;
        blocks.push(currentBlock.trim());
        currentBlock = "";
        inCodeBlock = false;
        codeBlockFence = "";
      } else {
        currentBlock += `${line}\n`;
      }
    } else if (inCodeBlock) {
      // Inside code block, keep adding lines
      currentBlock += `${line}\n`;
    } else if (line.trim() === "" && currentBlock.trim()) {
      // Empty line and we have content - potential block break
      const nextNonEmptyIndex = lines.findIndex((l, idx) => idx > i && l.trim() !== "");
      if (nextNonEmptyIndex === -1 || nextNonEmptyIndex > i + 1) {
        // This is a paragraph break
        blocks.push(currentBlock.trim());
        currentBlock = "";
      } else {
        currentBlock += `${line}\n`;
      }
    } else {
      currentBlock += `${line}\n`;
    }
  }

  // Add remaining content
  if (currentBlock.trim()) {
    blocks.push(currentBlock.trim());
  }

  // Filter out empty blocks and merge very short blocks
  const filteredBlocks = blocks.filter((block) => block.trim().length > 0);
  const mergedBlocks: string[] = [];

  for (let i = 0; i < filteredBlocks.length; i++) {
    const block = filteredBlocks[i];

    // If block is very short (less than 50 chars) and not a code block, try to merge with next
    if (block.length < 50 && !block.includes("```") && i < filteredBlocks.length - 1) {
      const nextBlock = filteredBlocks[i + 1];
      if (!nextBlock.includes("```")) {
        mergedBlocks.push(`${block}\n\n${nextBlock}`);
        i++; // Skip next block as it's been merged
        continue;
      }
    }

    mergedBlocks.push(block);
  }

  return mergedBlocks.length > 0 ? mergedBlocks : [content];
}

/**
 * Determines if content should be expandable based on its length and structure
 * @param content - The markdown content to check
 * @returns Boolean indicating if content should be expandable
 */
export function shouldContentBeExpandable(content: string): boolean {
  if (!content) return false;

  const blocks = splitContentIntoBlocks(content);
  const totalLength = content.length;

  // Make expandable if:
  // - More than 2 blocks AND total length > 300 chars
  // - OR more than 4 blocks regardless of length
  // - OR single block longer than 500 chars
  return (
    (blocks.length > 2 && totalLength > 300) ||
    blocks.length > 4 ||
    (blocks.length === 1 && totalLength > 500)
  );
}

/**
 * Gets the initial blocks to show before expansion
 * @param blocks - Array of content blocks
 * @returns Number of blocks to show initially
 */
export function getInitialBlockCount(blocks: string[]): number {
  if (blocks.length <= 2) return blocks.length;

  // Show first 2 blocks initially, or first block if it's very long
  const firstBlockLength = blocks[0]?.length || 0;
  return firstBlockLength > 400 ? 1 : 2;
}
