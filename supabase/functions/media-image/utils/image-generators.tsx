import { render } from "@deno/gfm";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "og_edge";
import React from "react";
import { parseHtmlSafely } from "./html-parser.ts";

type ImageFormat = "opengraph" | "twitter";
type ContentType = "user" | "post";

interface UserProfileData {
  displayName: string;
  username: string;
  bio: string;
  followerCount: number;
  avatarUrl?: string;
}

interface PostThreadData {
  createdAt: string;
  authorName: string;
  authorUsername: string;
  avatarUrl?: string;
  displayContent: string;
  content: string;
  starCount: number;
  coffeeCount: number;
  approveCount: number;
}

export function getImageDimensions(format: ImageFormat) {
  return format === "opengraph" ? { width: 1200, height: 630 } : { width: 1200, height: 600 }; // Twitter
}

export function createUserProfileImage(userData: UserProfileData, format: ImageFormat) {
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

export async function createPostThreadImage(postData: PostThreadData, format: ImageFormat) {
  const dimensions = getImageDimensions(format);
  const interBold = await readFile(join(process.cwd(), "fonts/Inter/Inter_18pt-Bold.ttf"));
  const interFont = await readFile(join(process.cwd(), "fonts/Inter/Inter_18pt-Regular.ttf"));

  const interItalic = await readFile(join(process.cwd(), "fonts/Inter/Inter_18pt-Italic.ttf"));

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "black",
          color: "white",
          fontFamily: "Inter",
          padding: "60px",
          backgroundImage: "linear-gradient(to right, #24243e, #302b63, #0f0c29)",
        }}
      >
        {/* Header */}
        {/* <div
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
        </div> */}

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "80%",
            maxHeight: "100%",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Content Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: "30px",
              justifyContent: "space-between",
            }}
          >
            {/* User Avatar */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* Avatar */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "40px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "20px",
                  fontSize: "32px",
                  overflow: "hidden",
                  outline: "20px solid blue",
                }}
              >
                {postData.avatarUrl && (
                  <img
                    src={postData.avatarUrl}
                    alt={postData.authorName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                {(!postData.avatarUrl || postData.avatarUrl === "") && (
                  <div style={{ fontSize: "32px" }}>👤</div>
                )}
              </div>

              {/* User Details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
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
                    color: "#d4d4d8",
                  }}
                >
                  {`@${postData.authorUsername}`}
                </div>
              </div>
            </div>
            {/* ByteBuzz logo */}
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#d4d4d8" }}>ByteBuzz</div>
          </div>

          {/* Content Body */}
          <div
            style={{
              fontSize: "20px",
              lineHeight: 1.3,
              marginBottom: "30px",
              maxWidth: "900px",
              opacity: 0.95,
              rowGap: "16px",
              maxHeight: "400px",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: "4px",
            }}
          >
            {/* Inner shadow simulation using gradient overlay */}

            {parseHtmlSafely(render(postData.displayContent))}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  postData.content.length > postData.displayContent.length
                    ? "linear-gradient(to bottom, transparent 0%, transparent 80%, rgba(24, 24, 27, 0.6) 100%)"
                    : "transparent",
                // background: "blue",
                borderRadius: "4px",
                pointerEvents: "none",
              }}
            />
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

          {/* Content Footer */}
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            {/* Date */}
            <div style={{ fontSize: "16px", opacity: 0.8 }}>
              {new Date(postData.createdAt).toLocaleDateString("en-US", {
                hour: "numeric",
                minute: "numeric",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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
      ],
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

export function createNotFoundImage(type: string, format: ImageFormat) {
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

export function createErrorImage(message: string) {
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
