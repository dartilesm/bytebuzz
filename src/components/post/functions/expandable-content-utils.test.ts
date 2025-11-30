import { describe, expect, it } from "vitest";
import {
  type ExpansionData,
  getDisplayContent,
  getExpansionData,
} from "@/components/post/functions/expandable-content-utils";

describe("expandable-content-utils", () => {
  describe("getDisplayContent", () => {
    const mockExpansionData: ExpansionData = {
      levels: 3,
      thresholds: [100, 200, 500],
      shouldShowControls: true,
    };

    it("should return full content when expansion level is at maximum", () => {
      const content = "This is a long content that should be fully displayed when at max level.";
      const result = getDisplayContent({
        content,
        expansionLevel: 2, // Max level (levels - 1)
        expansionData: mockExpansionData,
      });

      expect(result).toBe(content);
    });

    it("should return truncated content when expansion level is below maximum", () => {
      const content = "This is a long content that should be truncated at the specified threshold.";
      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData: mockExpansionData,
      });

      expect(result.length).toBeLessThanOrEqual(100);
      expect(result).toBe(content.substring(0, 100));
    });

    it("should find natural break points when truncating content", () => {
      const content =
        "First paragraph.\n\nSecond paragraph with more content that goes beyond the threshold.";
      const expansionData: ExpansionData = {
        levels: 2,
        thresholds: [20, 100],
        shouldShowControls: true,
      };

      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData,
      });

      // The natural break is at position 16, but 16 is not > 16 (80% of 20), so it cuts at exactly 20 chars
      expect(result).toBe("First paragraph.\n\nSe");
    });

    it("should prefer natural breaks that are close to the threshold", () => {
      const content =
        "Short text.\n\nThis is a much longer paragraph that contains a lot more content and should be cut at a natural break point.";
      const expansionData: ExpansionData = {
        levels: 2,
        thresholds: [50, 150],
        shouldShowControls: true,
      };

      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData,
      });

      // The natural break is at position 12, but 12 is not > 40 (80% of 50), so it cuts at exactly 50 chars
      expect(result).toBe("Short text.\n\nThis is a much longer paragraph that ");
    });

    it("should not use natural breaks that are too far from threshold", () => {
      const content =
        "Very short.\n\nThis is a much longer paragraph that should not be cut at the early break point because it would be too far from the threshold.";
      const expansionData: ExpansionData = {
        levels: 2,
        thresholds: [80, 150],
        shouldShowControls: true,
      };

      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData,
      });

      // Should cut at exactly 80 characters since the natural break is too early
      expect(result.length).toBe(80);
    });

    it("should handle content with markdown headers", () => {
      const content = "Introduction text.\n# Header\nMore content after header.";
      const expansionData: ExpansionData = {
        levels: 2,
        thresholds: [25, 60],
        shouldShowControls: true,
      };

      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData,
      });

      // The header break is at position 19, but 19 is not > 20 (80% of 25), so it cuts at exactly 25 chars
      expect(result).toBe("Introduction text.\n# Head");
    });

    it("should handle content with code blocks", () => {
      const content =
        'Some text before code.\n```javascript\nconst code = "here";\n```\nMore text after.';
      const expansionData: ExpansionData = {
        levels: 2,
        thresholds: [30, 80],
        shouldShowControls: true,
      };

      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData,
      });

      // The code block break is at position 22, but 22 is not > 24 (80% of 30), so it cuts at exactly 30 chars
      expect(result).toBe("Some text before code.\n```java");
    });

    it("should handle content with lists", () => {
      const content = "Introduction.\n- First item\n- Second item\nMore content.";
      const expansionData: ExpansionData = {
        levels: 2,
        thresholds: [20, 50],
        shouldShowControls: true,
      };

      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData,
      });

      // The list break is at position 13, but 13 is not > 16 (80% of 20), so it cuts at exactly 20 chars
      expect(result).toBe("Introduction.\n- Firs");
    });

    it("should handle content with numbered lists", () => {
      const content = "Introduction.\n1. First item\n2. Second item\nMore content.";
      const expansionData: ExpansionData = {
        levels: 2,
        thresholds: [20, 50],
        shouldShowControls: true,
      };

      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData,
      });

      // The numbered list break is at position 13, but 13 is not > 16 (80% of 20), so it cuts at exactly 20 chars
      expect(result).toBe("Introduction.\n1. Fir");
    });

    it("should handle content with horizontal rules", () => {
      const content = "First section.\n---\nSecond section with more content.";
      const expansionData: ExpansionData = {
        levels: 2,
        thresholds: [20, 50],
        shouldShowControls: true,
      };

      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData,
      });

      // The horizontal rule break is at position 15, but 15 is not > 16 (80% of 20), so it cuts at exactly 20 chars
      expect(result).toBe("First section.\n---\nS");
    });

    it("should use natural breaks when they are beyond 80% threshold", () => {
      const content =
        "This is a longer introduction text.\n\nThis is a much longer paragraph that should be cut at the natural break point.";
      const expansionData: ExpansionData = {
        levels: 2,
        thresholds: [40, 100],
        shouldShowControls: true,
      };

      const result = getDisplayContent({
        content,
        expansionLevel: 0,
        expansionData,
      });

      // The natural break is at position 35, and 35 > 32 (80% of 40), so it uses the break point + break length
      expect(result).toBe("This is a longer introduction text.\n\n");
    });
  });

  describe("getExpansionData", () => {
    it("should return single level for content shorter than minimum length", () => {
      const content = "Short content";
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 50,
      });

      expect(result).toEqual({
        levels: 1,
        thresholds: [content.length],
        shouldShowControls: false,
      });
    });

    it("should return single level for content equal to minimum length", () => {
      const content = "a".repeat(100);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 50,
      });

      expect(result).toEqual({
        levels: 1,
        thresholds: [100],
        shouldShowControls: false,
      });
    });

    it("should create multiple levels for content longer than minimum", () => {
      const content = "a".repeat(300);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 50,
      });

      expect(result.levels).toBeGreaterThan(1);
      expect(result.shouldShowControls).toBe(true);
      expect(result.thresholds).toHaveLength(result.levels);
      expect(result.thresholds[0]).toBeGreaterThan(0);
      expect(result.thresholds[result.thresholds.length - 1]).toBe(content.length);
    });

    it("should set initial threshold to 60% of minimum content length", () => {
      const content = "a".repeat(200);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 50,
      });

      const expectedInitialThreshold = Math.max(100 * 0.6, 100); // 100
      expect(result.thresholds[0]).toBe(expectedInitialThreshold);
    });

    it("should ensure initial threshold is at least 100 characters", () => {
      const content = "a".repeat(200);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 50, // 60% would be 30, but should be at least 100
        charsPerLevel: 25,
      });

      expect(result.thresholds[0]).toBe(100);
    });

    it("should distribute remaining content across levels", () => {
      const content = "a".repeat(400);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 50,
      });

      // Check that thresholds are in ascending order
      for (let i = 1; i < result.thresholds.length; i++) {
        expect(result.thresholds[i]).toBeGreaterThan(result.thresholds[i - 1]);
      }

      // Check that final threshold equals content length
      expect(result.thresholds[result.thresholds.length - 1]).toBe(content.length);
    });

    it("should not exceed maximum levels", () => {
      const content = "a".repeat(1000);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 50,
      });

      const maxLevels = Math.ceil(((content.length - 100) / 50) * 1.5);
      expect(result.levels).toBeLessThanOrEqual(maxLevels);
    });

    it("should handle edge case with very small charsPerLevel", () => {
      const content = "a".repeat(200);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 10,
      });

      expect(result.levels).toBeGreaterThan(1);
      expect(result.shouldShowControls).toBe(true);
      expect(result.thresholds[result.thresholds.length - 1]).toBe(content.length);
    });

    it("should handle edge case with very large charsPerLevel", () => {
      const content = "a".repeat(200);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 1000,
      });

      expect(result.levels).toBeGreaterThanOrEqual(1);
      expect(result.thresholds[result.thresholds.length - 1]).toBe(content.length);
    });

    it("should ensure no duplicate final threshold", () => {
      const content = "a".repeat(300);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 50,
      });

      const lastThreshold = result.thresholds[result.thresholds.length - 1];
      const secondLastThreshold = result.thresholds[result.thresholds.length - 2];

      expect(lastThreshold).toBe(content.length);
      expect(lastThreshold).not.toBe(secondLastThreshold);
    });

    it("should handle empty content", () => {
      const content = "";
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 50,
      });

      expect(result).toEqual({
        levels: 1,
        thresholds: [0],
        shouldShowControls: false,
      });
    });

    it("should handle content with exactly minimum length + 1", () => {
      const content = "a".repeat(101);
      const result = getExpansionData({
        content,
        minVisibleContentLength: 100,
        charsPerLevel: 50,
      });

      expect(result.levels).toBeGreaterThan(1);
      expect(result.shouldShowControls).toBe(true);
      expect(result.thresholds[0]).toBe(100); // 60% of 100 = 60, but minimum is 100
      expect(result.thresholds[result.thresholds.length - 1]).toBe(101);
    });
  });
});
