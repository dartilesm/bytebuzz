import type { ContentItem } from "@/context/content-viewer-context";

/**
 * Union type for all possible markdown component events
 * Easily extensible - just add a new union member for new events
 */
export type MarkdownComponentEvent =
  | {
      source: "img";
      type: "click";
      payload: {
        contentItems: ContentItem[];
        index: number;
        postId: string;
      };
    }
  | {
      source: "code";
      type: "click";
      payload: {
        contentItems: ContentItem[];
        index: number;
        postId: string;
      };
    }
  | {
      source: "p";
      type: "click";
      payload: undefined;
    }
  | {
      source: "ul";
      type: "click";
      payload: undefined;
    }
  | {
      source: "ol";
      type: "click";
      payload: undefined;
    };
