/**
 * Extracts dominant colors from an image using Canvas API
 * @param imageUrl - URL of the image to analyze
 * @param colorCount - Number of colors to extract (default: 5)
 * @returns Promise that resolves to an array of hex color strings
 */
export async function extractDominantColors(
  imageUrl: string,
  colorCount: number = 5,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colorMap = new Map<string, number>();

      // Sample pixels (every 10th pixel for performance)
      for (let i = 0; i < pixels.length; i += 40) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        // Quantize colors to reduce noise
        const quantizedR = Math.floor(r / 32) * 32;
        const quantizedG = Math.floor(g / 32) * 32;
        const quantizedB = Math.floor(b / 32) * 32;

        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }

      // Sort by frequency and get top colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount)
        .map(([colorKey]) => {
          const [r, g, b] = colorKey.split(",").map(Number);
          return rgbToHex(r, g, b);
        });

      resolve(sortedColors);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}

/**
 * Converts RGB values to hex color string
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string (e.g., "#667eea")
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join("")}`;
}

/**
 * Generates a CSS gradient string from an array of colors
 * @param colors - Array of hex color strings
 * @param direction - Gradient direction (default: "to bottom")
 * @returns CSS gradient string
 */
export function generateGradientFromColors(
  colors: string[],
  direction: string = "to bottom",
): string {
  if (colors.length === 0) {
    return "linear-gradient(to bottom, #667eea, #764ba2)"; // fallback
  }

  if (colors.length === 1) {
    return `linear-gradient(${direction}, ${colors[0]}, ${colors[0]})`;
  }

  const colorStops = colors
    .map((color, index) => {
      const stop = (index / (colors.length - 1)) * 100;
      return `${color} ${stop}%`;
    })
    .join(", ");

  return `linear-gradient(${direction}, ${colorStops})`;
}
