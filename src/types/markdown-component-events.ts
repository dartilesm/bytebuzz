type ImageData = { src: string; alt: string };

/**
 * Union type for all possible markdown component events
 * Easily extensible - just add a new union member for new events
 */
export type MarkdownComponentEvent =
  | {
      source: "img";
      type: "click";
      payload: {
        images: ImageData[];
        index: number;
        postId: string;
      };
    }
  | {
      source: "code";
      type: "click";
      payload: {
        language: string;
        code: string;
        filename?: string;
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
