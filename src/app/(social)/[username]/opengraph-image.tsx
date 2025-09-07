import { ImageResponse } from "next/og";
import { createServerSupabaseClient } from "@/db/supabase";

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/**
 * Generates dynamic Open Graph image for user profile pages
 * Shows user avatar, name, username, bio, and follower count
 */
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const formattedUsername = decodeURIComponent(username).replace("@", "");

  // Fetch user data
  const supabaseClient = createServerSupabaseClient();
  const { data: userProfile } = await supabaseClient
    .from("users")
    .select("*")
    .eq("username", formattedUsername)
    .single();

  if (!userProfile) {
    // Fallback image for user not found
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 24 }}>👤</div>
        <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 16 }}>User Not Found</div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>ByteBuzz</div>
      </div>,
      { ...size },
    );
  }

  const displayName = userProfile.display_name || userProfile.username;
  const bio = userProfile.bio || "Developer on ByteBuzz";
  const followerCount = userProfile.follower_count || 0;
  const avatarUrl = userProfile.image_url;

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
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
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
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
          {displayName}
        </div>

        <div
          style={{
            fontSize: "32px",
            opacity: 0.8,
            marginBottom: "24px",
          }}
        >
          @{userProfile.username}
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
          {bio.length > 100 ? `${bio.substring(0, 100)}...` : bio}
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
          <span>{followerCount.toLocaleString()} followers</span>
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
    { ...size },
  );
}
