import React from "https://esm.sh/react@18.2.0?deno-std=0.177.0";
import { ImageResponse } from "https://deno.land/x/og_edge@0.0.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdminClient = createClient(
  // Supabase API URL - env var exported by default when deployed.
  Deno.env.get("SUPABASE_URL") ?? "",
  // Supabase API SERVICE ROLE KEY - env var exported by default when deployed.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

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
  content: string;
  starCount: number;
  coffeeCount: number;
  approveCount: number;
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const identifier = url.searchParams.get("id"); // username or postId

  if (!type || !identifier) {
    return new ImageResponse(
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
        <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 16 }}>Missing Parameters</div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>ByteBuzz</div>
      </div>,
      { width: 1200, height: 600 },
    );
  }

  try {
    if (type === "user") {
      const userData = await fetchUserData(identifier);
      if (!userData) {
        return createNotFoundImage("user");
      }
      return createUserProfileImage(userData);
    } else if (type === "post") {
      const postData = await fetchPostData(identifier);
      if (!postData) {
        return createNotFoundImage("post");
      }
      return createPostThreadImage(postData);
    } else {
      return createNotFoundImage(type);
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return createNotFoundImage("error");
  }
}

async function fetchUserData(username: string): Promise<UserProfileData | null> {
  try {
    const { data: userProfile, error } = await supabaseAdminClient
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !userProfile) {
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
    const { data: postAncestry, error } = await supabaseAdminClient.rpc("get_post_ancestry", {
      start_id: postId,
    });

    if (error || !postAncestry || postAncestry.length === 0) {
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
      .replace(/`[^`]*`/g, "") // Remove inline code
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    const displayContent =
      cleanContent.length > 200 ? `${cleanContent.substring(0, 200)}...` : cleanContent;

    return {
      authorName,
      authorUsername,
      avatarUrl,
      content: displayContent,
      starCount: mainPost.star_count || 0,
      coffeeCount: mainPost.coffee_count || 0,
      approveCount: mainPost.approve_count || 0,
    };
  } catch (error) {
    console.error("Error fetching post data:", error);
    return null;
  }
}

function createUserProfileImage(userData: UserProfileData) {
  return new ImageResponse(
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
    </div>,
    { width: 1200, height: 600 },
  );
}

function createPostThreadImage(postData: PostThreadData) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
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
            fontSize: "24px",
            lineHeight: 1.4,
            marginBottom: "30px",
            maxWidth: "900px",
            opacity: 0.95,
          }}
        >
          {postData.content}
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
    </div>,
    { width: 1200, height: 600 },
  );
}

function createNotFoundImage(type: string) {
  const emoji = type === "user" ? "👤" : type === "post" ? "📝" : "❌";
  const title = type === "user" ? "User Not Found" : type === "post" ? "Post Not Found" : "Error";

  return new ImageResponse(
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
      <div style={{ fontSize: 72, marginBottom: 24 }}>{emoji}</div>
      <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 16 }}>{title}</div>
      <div style={{ fontSize: 32, opacity: 0.8 }}>ByteBuzz</div>
    </div>,
    { width: 1200, height: 600 },
  );
}
