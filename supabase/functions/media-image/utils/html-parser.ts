import HTMLReactParser from "html-react-parser";
import React from "react";

const DEFAULT_DISPLAY = "flex";

// Define the type for supported element names
type SupportedElementName = keyof typeof SUPPORTED_ELEMENTS_WITH_STYLES;

// Supported HTML elements for og_edge/Satori with their default styles
const SUPPORTED_ELEMENTS_WITH_STYLES = {
  p: {
    display: DEFAULT_DISPLAY,
    marginTop: "1em",
    marginBottom: "1em",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  div: {
    display: DEFAULT_DISPLAY,
  },
  blockquote: {
    display: DEFAULT_DISPLAY,
    marginTop: "1em",
    marginBottom: "1em",
    marginLeft: 40,
    marginRight: 40,
  },
  center: {
    display: DEFAULT_DISPLAY,
    textAlign: "center",
  },
  hr: {
    display: DEFAULT_DISPLAY,
    marginTop: "0.5em",
    marginBottom: "0.5em",
    marginLeft: "auto",
    marginRight: "auto",
    borderWidth: 1,
    // We don't have `inset`
    borderStyle: "solid",
  },
  // Heading elements
  h1: {
    display: DEFAULT_DISPLAY,
    fontSize: "2em",
    marginTop: "0.67em",
    marginBottom: "0.67em",
    marginLeft: 0,
    marginRight: 0,
    fontWeight: "bold",
  },
  h2: {
    display: DEFAULT_DISPLAY,
    fontSize: "1.5em",
    marginTop: "0.83em",
    marginBottom: "0.83em",
    marginLeft: 0,
    marginRight: 0,
    fontWeight: "bold",
  },
  h3: {
    display: DEFAULT_DISPLAY,
    fontSize: "1.17em",
    marginTop: "1em",
    marginBottom: "1em",
    marginLeft: 0,
    marginRight: 0,
    fontWeight: "bold",
  },
  h4: {
    display: DEFAULT_DISPLAY,
    marginTop: "1.33em",
    marginBottom: "1.33em",
    marginLeft: 0,
    marginRight: 0,
    fontWeight: "bold",
  },
  h5: {
    display: DEFAULT_DISPLAY,
    fontSize: "0.83em",
    marginTop: "1.67em",
    marginBottom: "1.67em",
    marginLeft: 0,
    marginRight: 0,
    fontWeight: "bold",
  },
  h6: {
    display: DEFAULT_DISPLAY,
    fontSize: "0.67em",
    marginTop: "2.33em",
    marginBottom: "2.33em",
    marginLeft: 0,
    marginRight: 0,
    fontWeight: "bold",
  },
  // Tables
  // Lists
  // Form elements
  // Inline elements
  u: {
    textDecoration: "underline",
  },
  strong: {
    fontWeight: "bold",
  },
  b: {
    fontWeight: "bold",
  },
  i: {
    fontStyle: "italic",
  },
  em: {
    fontStyle: "italic",
  },
  code: {
    fontFamily: "monospace",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "0px 4px",
    margin: "0px 8px",
  },
  kbd: {
    fontFamily: "monospace",
  },
  pre: {
    display: DEFAULT_DISPLAY,
    fontFamily: "monospace",
    whiteSpace: "pre",
    marginTop: "1em",
    marginBottom: "1em",
  },
  mark: {
    backgroundColor: "yellow",
    color: "black",
  },
  big: {
    fontSize: "larger",
  },
  small: {
    fontSize: "smaller",
  },
  s: {
    textDecoration: "line-through",
  },
} as const;

const SUPPORTED_ELEMENTS = new Set(Object.keys(SUPPORTED_ELEMENTS_WITH_STYLES));

/**
 * Safely parses HTML content and returns only elements supported by og_edge/Satori
 * with their default styles applied
 * @param html - The HTML string to parse
 * @returns React elements with only supported HTML tags and default styles
 */
export function parseHtmlSafely(html: string) {
  if (!html || typeof html !== "string") {
    return null;
  }

  const options = {
    replace: (domNode: any) => {
      // Handle text nodes
      if (domNode.type === "text") {
        return domNode.data;
      }

      // Handle tag nodes
      if (domNode.type === "tag") {
        // If element is not supported, return null to remove it
        if (!SUPPORTED_ELEMENTS.has(domNode.name)) {
          return null;
        }

        // Type-safe access to default styles
        const elementName = domNode.name as SupportedElementName;
        const defaultStyles = SUPPORTED_ELEMENTS_WITH_STYLES[elementName] || {};

        // Clean attributes to only include safe ones for og_edge
        const cleanAttribs: Record<string, any> = {};
        if (domNode.attribs) {
          // Only allow safe attributes
          const safeAttribs = ["class", "id", "src", "alt", "href", "target"];
          for (const [key, value] of Object.entries(domNode.attribs)) {
            if (safeAttribs.includes(key) && typeof value === "string") {
              cleanAttribs[key] = value;
            }
          }
        }

        // Merge default styles with any existing inline styles
        let mergedStyles = { ...defaultStyles };
        if (domNode.attribs && domNode.attribs.style) {
          // Parse existing inline styles and merge with defaults
          const existingStyles: Record<string, string> = {};
          if (typeof domNode.attribs.style === "string") {
            domNode.attribs.style.split(";").forEach((rule: string) => {
              const [property, value] = rule.split(":").map((s) => s.trim());
              if (property && value) {
                existingStyles[property] = value;
              }
            });
          }
          mergedStyles = { ...defaultStyles, ...existingStyles };
        }

        // Add the merged styles to attributes
        cleanAttribs.style = mergedStyles;

        // For supported elements, process children recursively
        if (domNode.children && domNode.children.length > 0) {
          const processedChildren = domNode.children
            .map((child: any) => {
              if (child.type === "text") {
                return child.data;
              }
              if (child.type === "tag" && SUPPORTED_ELEMENTS.has(child.name)) {
                const childElementName = child.name as SupportedElementName;
                const childDefaultStyles = SUPPORTED_ELEMENTS_WITH_STYLES[childElementName] || {};
                const childAttribs = { ...child.attribs, style: childDefaultStyles };
                return React.createElement(
                  child.name,
                  childAttribs,
                  ...(child.children || [])
                    .map((grandChild: any) => (grandChild.type === "text" ? grandChild.data : null))
                    .filter(Boolean)
                );
              }
              return null;
            })
            .filter(Boolean);

          return React.createElement(domNode.name, cleanAttribs, ...processedChildren);
        }

        // Self-closing or empty elements
        return React.createElement(domNode.name, cleanAttribs);
      }

      return null;
    },
  };

  try {
    const result = HTMLReactParser(html, options);
    return result;
  } catch (error) {
    console.error("Error parsing HTML:", error, { html: html.substring(0, 200) });
    return null;
  }
}