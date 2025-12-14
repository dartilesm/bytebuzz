import satori from "satori";
import { ReactElement } from "react";
import { Resvg } from "@resvg/resvg-js";

type Font = {
  name: string;
  data: ArrayBuffer | Uint8Array;
  weight?: number;
  style?: "normal" | "italic";
};

type ImageResponseOptions = {
  width: number;
  height: number;
  fonts?: Font[];
};

/**
 * Custom ImageResponse implementation using satori
 * This is a workaround for og_edge dependency issues with yoga-layout
 */
export class ImageResponse extends Response {
  constructor(element: ReactElement, options: ImageResponseOptions) {
    const init = {
      headers: {
        "Content-Type": "image/png",
      },
    };

    const body = new ReadableStream({
      async start(controller) {
        try {
          // Convert fonts to the format satori expects
          const satoriFonts = options.fonts?.map((font) => ({
            name: font.name,
            data: font.data instanceof ArrayBuffer ? new Uint8Array(font.data) : font.data,
            weight: font.weight || 400,
            style: font.style || "normal",
          })) || [];

          // Render JSX to SVG using satori
          const svg = await satori(element, {
            width: options.width,
            height: options.height,
            fonts: satoriFonts,
          });

          // Convert SVG to PNG using resvg
          const png = await svgToPng(svg, options.width, options.height);

          controller.enqueue(new Uint8Array(png));
          controller.close();
        } catch (error) {
          console.error("Error generating image:", error);
          controller.error(error);
        }
      },
    });

    super(body, init);
  }
}

/**
 * Converts SVG string to PNG buffer using @resvg/resvg-js
 */
async function svgToPng(svg: string, width: number, height: number): Promise<ArrayBuffer> {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width,
    },
  });
  
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  return pngBuffer.buffer;
}

