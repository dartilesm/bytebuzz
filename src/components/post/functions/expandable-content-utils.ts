export interface ExpansionData {
  levels: number;
  thresholds: number[];
  shouldShowControls: boolean;
}

export function getDisplayContent({
  content,
  expansionLevel,
  expansionData,
}: {
  content: string;
  expansionLevel: number;
  expansionData: ExpansionData;
}) {
  if (expansionLevel >= expansionData.levels - 1) {
    return content; // Show full content
  }

  const charsToShow = expansionData.thresholds[expansionLevel];
  const truncatedContent = content.substring(0, charsToShow);

  // Try to cut at a natural break point
  const naturalBreaks = ["\n\n", "\n#", "\n```", "\n---", "\n- ", "\n1. "];
  let bestCutPoint = charsToShow;

  for (const breakPoint of naturalBreaks) {
    const lastBreak = truncatedContent.lastIndexOf(breakPoint);
    if (lastBreak > charsToShow * 0.8) {
      bestCutPoint = lastBreak + breakPoint.length;
      break;
    }
  }

  return content.substring(0, bestCutPoint);
}

export function getExpansionData({
  content,
  minVisibleContentLength,
  charsPerLevel,
}: {
  content: string;
  minVisibleContentLength: number;
  charsPerLevel: number;
}) {
  const maxLevels = Math.ceil(((content.length - minVisibleContentLength) / charsPerLevel) * 1.5);
  const contentLength = content.length;

  // Don't show expansion controls if content is too short
  if (contentLength <= minVisibleContentLength) {
    return {
      levels: 1,
      thresholds: [contentLength],
      shouldShowControls: false,
    };
  }

  const initialThreshold = Math.max(minVisibleContentLength * 0.6, 100); // Show 60% of minVisibleContentLength initially
  const remainingContent = contentLength - initialThreshold;
  const remainingLevels = maxLevels - 1;
  const remainingCharsPerLevels =
    remainingLevels > 0 ? Math.ceil(remainingContent / remainingLevels) : remainingContent;

  const calculatedLevels = Math.min(
    Math.ceil((contentLength - initialThreshold) / remainingCharsPerLevels) + 1,
    maxLevels,
  );

  const thresholds = [initialThreshold];
  for (let i = 1; i < calculatedLevels; i++) {
    const nextThreshold = Math.min(initialThreshold + i * remainingCharsPerLevels, contentLength);
    thresholds.push(nextThreshold);
  }

  // Ensure we don't duplicate the final threshold
  if (thresholds[thresholds.length - 1] !== contentLength) {
    thresholds.push(contentLength);
  }

  return {
    levels: thresholds.length,
    thresholds,
    shouldShowControls: thresholds.length > 1,
  };
}
