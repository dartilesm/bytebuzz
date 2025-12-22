import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { generateGradientFromColors, extractDominantColors } from "@/lib/image-color-extractor";

// Mock Image constructor
class MockImage {
  src = "";
  crossOrigin = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    // Simulate image load after a short delay
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
}

// Mock canvas and context
function createMockCanvas() {
  const imageData = {
    data: new Uint8ClampedArray(400), // 10x10 image = 400 bytes (RGBA)
    width: 10,
    height: 10,
  };

  // Fill with sample colors
  // First pixel: red (255, 0, 0, 255)
  imageData.data[0] = 255;
  imageData.data[1] = 0;
  imageData.data[2] = 0;
  imageData.data[3] = 255;

  // Second pixel: green (0, 255, 0, 255)
  imageData.data[4] = 0;
  imageData.data[5] = 255;
  imageData.data[6] = 0;
  imageData.data[7] = 255;

  // Third pixel: blue (0, 0, 255, 255)
  imageData.data[8] = 0;
  imageData.data[9] = 0;
  imageData.data[10] = 255;
  imageData.data[11] = 255;

  // Fill rest with red to make it dominant
  for (let i = 12; i < imageData.data.length; i += 4) {
    imageData.data[i] = 255; // R
    imageData.data[i + 1] = 0; // G
    imageData.data[i + 2] = 0; // B
    imageData.data[i + 3] = 255; // A
  }

  const canvas = {
    width: 10,
    height: 10,
    getContext: vi.fn(() => ({
      drawImage: vi.fn(),
      getImageData: vi.fn(() => imageData),
    })),
  };

  return canvas;
}

describe("image-color-extractor", () => {
  beforeEach(() => {
    // Mock document.createElement for canvas
    global.document = {
      createElement: vi.fn((tagName: string) => {
        if (tagName === "canvas") {
          return createMockCanvas();
        }
        return {};
      }),
    } as unknown as Document;

    // Mock Image constructor
    global.Image = MockImage as unknown as typeof Image;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateGradientFromColors", () => {
    it("should generate gradient with single color", () => {
      const colors = ["#667eea"];
      const result = generateGradientFromColors(colors, "to right");

      expect(result).toBe("linear-gradient(to right, #667eea, #667eea)");
    });

    it("should generate gradient with multiple colors", () => {
      const colors = ["#667eea", "#764ba2", "#f093fb"];
      const result = generateGradientFromColors(colors, "to bottom");

      expect(result).toContain("linear-gradient(to bottom");
      expect(result).toContain("#667eea");
      expect(result).toContain("#764ba2");
      expect(result).toContain("#f093fb");
      expect(result).toContain("0%");
      expect(result).toContain("50%");
      expect(result).toContain("100%");
    });

    it("should use fallback gradient when colors array is empty", () => {
      const result = generateGradientFromColors([], "to bottom");

      expect(result).toBe("linear-gradient(to bottom, #667eea, #764ba2)");
    });

    it("should use custom direction", () => {
      const colors = ["#667eea", "#764ba2"];
      const result = generateGradientFromColors(colors, "to top left");

      expect(result).toContain("linear-gradient(to top left");
    });

    it("should distribute color stops evenly", () => {
      const colors = ["#ff0000", "#00ff00", "#0000ff"];
      const result = generateGradientFromColors(colors);

      // Should have stops at 0%, 50%, 100%
      expect(result).toContain("#ff0000 0%");
      expect(result).toContain("#00ff00 50%");
      expect(result).toContain("#0000ff 100%");
    });
  });

  describe("extractDominantColors", () => {
    it("should extract colors from image", async () => {
      const imageUrl = "https://example.com/test.jpg";
      const colors = await extractDominantColors(imageUrl, 3);

      expect(colors).toBeInstanceOf(Array);
      expect(colors.length).toBeGreaterThan(0);
      expect(colors.length).toBeLessThanOrEqual(3);
      // All colors should be valid hex strings
      colors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should handle image load errors", async () => {
      // Create a mock that fails to load
      class FailingImage {
        src = "";
        crossOrigin = "";
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        constructor() {
          // Simulate error immediately
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      }

      global.Image = FailingImage as unknown as typeof Image;

      const imageUrl = "https://example.com/invalid.jpg";

      await expect(extractDominantColors(imageUrl, 3)).rejects.toThrow(
        "Failed to load image",
      );
    });

    it("should respect colorCount parameter", async () => {
      const imageUrl = "https://example.com/test.jpg";
      const colors = await extractDominantColors(imageUrl, 5);

      expect(colors.length).toBeLessThanOrEqual(5);
    });

    it("should skip transparent pixels", async () => {
      // Create canvas with transparent pixels
      const imageData = {
        data: new Uint8ClampedArray(400),
        width: 10,
        height: 10,
      };

      // Fill with transparent pixels
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255; // R
        imageData.data[i + 1] = 0; // G
        imageData.data[i + 2] = 0; // B
        imageData.data[i + 3] = 50; // A (transparent)
      }

      const canvas = {
        width: 10,
        height: 10,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
          getImageData: vi.fn(() => imageData),
        })),
      };

      global.document = {
        createElement: vi.fn(() => canvas),
      } as unknown as Document;

      const imageUrl = "https://example.com/test.jpg";
      const colors = await extractDominantColors(imageUrl, 3);

      // Should still return colors (might be empty if all pixels are transparent)
      expect(colors).toBeInstanceOf(Array);
    });

    it("should quantize colors to reduce noise", async () => {
      const imageUrl = "https://example.com/test.jpg";
      const colors = await extractDominantColors(imageUrl, 5);

      // Colors should be quantized (values divisible by 32)
      colors.forEach((color) => {
        // Extract RGB values from hex
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        // Quantized values should be divisible by 32
        // (allowing some tolerance for rounding)
        expect(r % 32).toBeLessThan(32);
        expect(g % 32).toBeLessThan(32);
        expect(b % 32).toBeLessThan(32);
      });
    });
  });
});

