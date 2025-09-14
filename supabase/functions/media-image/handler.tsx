import { createClient } from "@supabase/supabase-js";
import React from "react";
import { ImageResponse } from "og_edge";
import { CSS, render } from "@deno/gfm";
import HTMLReactParser, { domToReact } from "html-react-parser";
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEFAULT_DISPLAY = "flex";

// Supported HTML elements for og_edge/Satori with their default styles
const SUPPORTED_ELEMENTS_WITH_STYLES = {
  p: {
    display: DEFAULT_DISPLAY,
    marginTop: "1em",
    marginBottom: "1em",
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
};

const SUPPORTED_ELEMENTS = new Set(Object.keys(SUPPORTED_ELEMENTS_WITH_STYLES));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Safely parses HTML content and returns only elements supported by og_edge/Satori
 * with their default styles applied
 * @param html - The HTML string to parse
 * @returns React elements with only supported HTML tags and default styles
 */
function parseHtmlSafely(html: string) {
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

        // Get default styles for this element
        const defaultStyles = SUPPORTED_ELEMENTS_WITH_STYLES[domNode.name] || {};

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
                const childDefaultStyles = SUPPORTED_ELEMENTS_WITH_STYLES[child.name] || {};
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

interface UserProfileData {
  displayName: string;
  username: string;
  bio: string;
  followerCount: number;
  avatarUrl?: string;
}

interface PostThreadData {
  authorName: string;
  authorUsername: string;
  avatarUrl?: string;
  displayContent: string;
  content: string;
  starCount: number;
  coffeeCount: number;
  approveCount: number;
}

type ImageFormat = "opengraph" | "twitter";
type ContentType = "user" | "post";

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") as ImageFormat; // "opengraph" or "twitter"
  const type = url.searchParams.get("type") as ContentType; // "user" or "post"
  const identifier = url.searchParams.get("id"); // username or postId

  if (!format || !type || !identifier) {
    return createErrorImage("Missing required parameters: format, type, and id");
  }

  if (!["opengraph", "twitter"].includes(format)) {
    return createErrorImage("Invalid format. Use 'opengraph' or 'twitter'");
  }

  if (!["user", "post"].includes(type)) {
    return createErrorImage("Invalid type. Use 'user' or 'post'");
  }

  try {
    if (type === "user") {
      const userData = await fetchUserData(identifier);
      if (!userData) {
        return createNotFoundImage("user", format);
      }
      return createUserProfileImage(userData, format);
    } else if (type === "post") {
      const postData = await fetchPostData(identifier);
      if (!postData) {
        return createNotFoundImage("post", format);
      }
      return await createPostThreadImage(postData, format);
    }
  } catch (error) {
    console.error("Error generating social media image:", error);
    return createErrorImage("Failed to generate image");
  }
}

async function fetchUserData(username: string): Promise<UserProfileData | null> {
  try {
    const { data: userProfile, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !userProfile) {
      console.error("Error fetching user:", error);
      return null;
    }

    return {
      displayName: userProfile.display_name || userProfile.username,
      username: userProfile.username,
      bio: userProfile.bio || "Developer on ByteBuzz",
      followerCount: userProfile.follower_count || 0,
      avatarUrl: userProfile.image_url,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

async function fetchPostData(postId: string): Promise<PostThreadData | null> {
  try {
    const { data: postAncestry, error } = await supabase.rpc("get_post_ancestry", {
      start_id: postId,
    });

    if (error || !postAncestry || postAncestry.length === 0) {
      console.error("Error fetching post:", error);
      return null;
    }

    const mainPost = postAncestry[postAncestry.length - 1];
    const author = mainPost.user;
    const authorName = author?.display_name || author?.username || "Unknown User";
    const authorUsername = author?.username || "";
    const avatarUrl = author?.image_url;

    // Clean the post content for display (basic markdown removal)
    const cleanContent = (mainPost.content || "")
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
      .trim();

    const displayContent =
      cleanContent.length > 200 ? `${cleanContent.substring(0, 200)}...` : cleanContent;

    return {
      authorName,
      authorUsername,
      avatarUrl,
      displayContent,
      content: mainPost.content || "",
      starCount: mainPost.star_count || 0,
      coffeeCount: mainPost.coffee_count || 0,
      approveCount: mainPost.approve_count || 0,
    };
  } catch (error) {
    console.error("Error fetching post data:", error);
    return null;
  }
}

function getImageDimensions(format: ImageFormat) {
  return format === "opengraph" ? { width: 1200, height: 630 } : { width: 1200, height: 600 }; // Twitter
}

function createUserProfileImage(userData: UserProfileData, format: ImageFormat) {
  const dimensions = getImageDimensions(format);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: "bold",
              opacity: 0.9,
            }}
          >
            ByteBuzz
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "60px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "30px",
              fontSize: "48px",
              overflow: "hidden",
            }}
          >
            {userData.avatarUrl ? (
              <img
                src={userData.avatarUrl}
                alt={userData.displayName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div style={{ fontSize: "48px" }}>👤</div>
            )}
          </div>

          {/* Name and Username */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "16px",
              lineHeight: 1.2,
            }}
          >
            {userData.displayName}
          </div>

          <div
            style={{
              fontSize: "32px",
              opacity: 0.8,
              marginBottom: "24px",
            }}
          >
            {`@${userData.username}`}
          </div>

          {/* Bio */}
          <div
            style={{
              fontSize: "24px",
              lineHeight: 1.4,
              marginBottom: "24px",
              opacity: 0.9,
              maxWidth: "600px",
            }}
          >
            {userData.bio.length > 100 ? `${userData.bio.substring(0, 100)}...` : userData.bio}
          </div>

          {/* Follower Count */}
          <div
            style={{
              fontSize: "20px",
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>👥</span>
            <span>{userData.followerCount.toLocaleString()} followers</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            fontSize: "20px",
            opacity: 0.6,
          }}
        >
          bytebuzz.dev
        </div>
      </div>
    ),
    dimensions
  );
}

async function createPostThreadImage(postData: PostThreadData, format: ImageFormat) {
  const dimensions = getImageDimensions(format);
  const interBold = await readFile(
    join(process.cwd(), 'fonts/Inter/Inter_18pt-Bold.ttf')
  )
  const interFont = await readFile(
    join(process.cwd(), 'fonts/Inter/Inter_18pt-Regular.ttf')
  )

  const interItalic = await readFile(
    join(process.cwd(), 'fonts/Inter/Inter_18pt-Italic.ttf')
  )

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontFamily: "Inter",
          padding: "60px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: "bold",
              opacity: 0.9,
            }}
          >
            ByteBuzz
          </div>
          <div
            style={{
              fontSize: 20,
              opacity: 0.6,
            }}
          >
            bytebuzz.dev
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Author Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "40px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "20px",
                fontSize: "32px",
                overflow: "hidden",
              }}
            >
              {postData.avatarUrl ? (
                <img
                  src={postData.avatarUrl}
                  alt={postData.authorName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{ fontSize: "32px" }}>👤</div>
              )}
            </div>

            {/* Author Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                {postData.authorName}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  opacity: 0.8,
                }}
              >
                {`@${postData.authorUsername}`}
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div
            style={{
              fontSize: "20px",
              lineHeight: 1.3,
              marginBottom: "30px",
              maxWidth: "900px",
              opacity: 0.95,
              maxHeight: "400px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {parseHtmlSafely(render(postData.displayContent))}
            {/* {(() => {
            try {
              const html = render(postData.content);
              console.log('Rendered HTML:', html.substring(0, 300));
              const parsed = parseHtmlSafely(html);
              console.log('Parsed result:', !!parsed);
              return parsed || <div style={{ color: 'white', fontSize: '18px' }}>{postData.displayContent}</div>;
            } catch (error) {
              console.error('Error rendering post content:', error);
              return <div style={{ color: 'white', fontSize: '18px' }}>{postData.displayContent}</div>;
            }
          })()} */}
          </div>

          {/* Engagement Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontSize: "18px",
              opacity: 0.8,
            }}
          >
            {postData.starCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⭐</span>
                <span>{postData.starCount}</span>
              </div>
            )}
            {postData.coffeeCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>☕</span>
                <span>{postData.coffeeCount}</span>
              </div>
            )}
            {postData.approveCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>👍</span>
                <span>{postData.approveCount}</span>
              </div>
            )}
            {postData.starCount === 0 &&
              postData.coffeeCount === 0 &&
              postData.approveCount === 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>💬</span>
                  <span>New post</span>
                </div>
              )}
          </div>
        </div>
      </div>
    ),
    {
      ...dimensions,
      fonts: [
        {
          name: "Inter",
          data: interBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Inter",
          data: interFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: interItalic,
          weight: 400,
          style: "italic",
        },
      ]
    }
  );

  const image2 = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          background: "lavender",
        }}
      >
        {parseHtmlSafely(render(postData.displayContent))}
      </div>
    ),
    {
      ...dimensions,
      debug: true,
    }
  );


  return image;
}

function createNotFoundImage(type: string, format: ImageFormat) {
  const dimensions = getImageDimensions(format);
  const emoji = type === "user" ? "👤" : "📝";
  const title = type === "user" ? "User Not Found" : "Post Not Found";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 24 }}>{emoji}</div>
        <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 16 }}>{title}</div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>ByteBuzz</div>
      </div>
    ),
    dimensions
  );
}

function createErrorImage(message: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 24 }}>❌</div>
        <div
          style={{
            fontSize: 32,
            fontWeight: "bold",
            marginBottom: 16,
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          {message}
        </div>
        <div style={{ fontSize: 24, opacity: 0.8 }}>ByteBuzz</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
