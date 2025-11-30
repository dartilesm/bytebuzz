import {
  type Image as CanvasImage,
  loadImage as canvasLoadImage,
  createCanvas,
  type CanvasRenderingContext2D as NodeCanvasRenderingContext2D,
} from "canvas";

// Image metadata
export const ogImageSize = {
  width: 1200,
  height: 630,
};

export const twitterImageSize = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

/**
 * Creates a gradient background on canvas
 */
export function createGradientBackground(
  ctx: NodeCanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#667eea");
  gradient.addColorStop(1, "#764ba2");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draws text with proper wrapping and centering
 */
export function drawWrappedText(
  ctx: NodeCanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  color: string = "white",
  align: "center" | "left" = "center",
) {
  ctx.fillStyle = color;
  ctx.textAlign = align;

  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = `${line}${words[i]} `;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = `${words[i]} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY;
}

/**
 * Loads an image from URL and returns a Promise
 */
export function loadImage(url: string): Promise<CanvasImage> {
  return canvasLoadImage(url);
}

/**
 * Draws a circular avatar on canvas
 */
export async function drawAvatar(
  ctx: NodeCanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  avatarUrl?: string,
) {
  if (avatarUrl) {
    try {
      const avatarImg = await loadImage(avatarUrl);
      // Create circular clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg, x, y, size, size);
      ctx.restore();
    } catch {
      // Fallback to emoji if image fails to load
      drawDefaultAvatar(ctx, x, y, size);
    }
  } else {
    // Draw default avatar
    drawDefaultAvatar(ctx, x, y, size);
  }
}

/**
 * Draws a default avatar (emoji) on canvas
 */
function drawDefaultAvatar(ctx: NodeCanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = `${size * 0.4}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("👤", x + size / 2, y + size / 2 - size * 0.2);
}

/**
 * Draws the ByteBuzz header
 */
export function drawHeader(
  ctx: NodeCanvasRenderingContext2D,
  width: number,
  showFooter: boolean = false,
) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "bold 32px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("ByteBuzz", 60, 60);

  if (showFooter) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "20px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("bytebuzz.dev", width - 60, 70);
  }
}

/**
 * Draws the footer
 */
export function drawFooter(ctx: NodeCanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "20px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("bytebuzz.dev", width - 60, height - 40);
}

/**
 * Generates user profile image data
 */
export interface UserProfileImageData {
  displayName: string;
  username: string;
  bio: string;
  followerCount: number;
  avatarUrl?: string;
}

/**
 * Generates post thread image data
 */
export interface PostThreadImageData {
  authorName: string;
  authorUsername: string;
  avatarUrl?: string;
  content: string;
  starCount: number;
  coffeeCount: number;
  approveCount: number;
}

/**
 * Creates a user profile image
 */
export async function createUserProfileImage(
  userData: UserProfileImageData,
  size: { width: number; height: number } = ogImageSize,
): Promise<Buffer> {
  const canvas = createCanvas(size.width, size.height);
  const ctx = canvas.getContext("2d");

  // Set up canvas
  ctx.textBaseline = "top";
  ctx.font = "32px system-ui, sans-serif";

  // Create gradient background
  createGradientBackground(ctx, size.width, size.height);

  // Draw header
  drawHeader(ctx, size.width);

  // Draw avatar
  const avatarSize = 120;
  const avatarX = size.width / 2 - avatarSize / 2;
  const avatarY = 150;

  await drawAvatar(ctx, avatarX, avatarY, avatarSize, userData.avatarUrl);

  // Draw name
  ctx.fillStyle = "white";
  ctx.font = "bold 48px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(userData.displayName, size.width / 2, avatarY + avatarSize + 40);

  // Draw username
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "32px system-ui, sans-serif";
  ctx.fillText(`@${userData.username}`, size.width / 2, avatarY + avatarSize + 100);

  // Draw bio
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "24px system-ui, sans-serif";
  const bioText = userData.bio.length > 100 ? `${userData.bio.substring(0, 100)}...` : userData.bio;
  drawWrappedText(ctx, bioText, size.width / 2, avatarY + avatarSize + 150, 600, 30);

  // Draw follower count
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "20px system-ui, sans-serif";
  ctx.fillText(
    `👥 ${userData.followerCount.toLocaleString()} followers`,
    size.width / 2,
    avatarY + avatarSize + 250,
  );

  // Draw footer
  drawFooter(ctx, size.width, size.height);

  return canvas.toBuffer("image/png");
}

/**
 * Creates a post thread image
 */
export async function createPostThreadImage(
  postData: PostThreadImageData,
  size: { width: number; height: number } = ogImageSize,
): Promise<Buffer> {
  const canvas = createCanvas(size.width, size.height);
  const ctx = canvas.getContext("2d");

  // Set up canvas
  ctx.textBaseline = "top";
  ctx.font = "32px system-ui, sans-serif";

  // Create gradient background
  createGradientBackground(ctx, size.width, size.height);

  // Draw header
  drawHeader(ctx, size.width, true);

  // Draw author info section
  const authorY = 150;
  const avatarSize = 80;
  const avatarX = 60;

  // Draw avatar
  await drawAvatar(ctx, avatarX, authorY, avatarSize, postData.avatarUrl);

  // Draw author name and username
  ctx.fillStyle = "white";
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(postData.authorName, avatarX + avatarSize + 20, authorY + 10);

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "20px system-ui, sans-serif";
  ctx.fillText(`@${postData.authorUsername}`, avatarX + avatarSize + 20, authorY + 45);

  // Draw post content
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.font = "24px system-ui, sans-serif";
  const contentY = authorY + avatarSize + 30;
  drawWrappedText(
    ctx,
    postData.content,
    60,
    contentY,
    900,
    30,
    "rgba(255, 255, 255, 0.95)",
    "left",
  );

  // Draw engagement stats
  const statsY = contentY + 120;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "18px system-ui, sans-serif";
  ctx.textAlign = "left";

  let statsX = 60;
  const statsGap = 80;

  if (postData.starCount > 0) {
    ctx.fillText(`⭐ ${postData.starCount}`, statsX, statsY);
    statsX += statsGap;
  }
  if (postData.coffeeCount > 0) {
    ctx.fillText(`☕ ${postData.coffeeCount}`, statsX, statsY);
    statsX += statsGap;
  }
  if (postData.approveCount > 0) {
    ctx.fillText(`👍 ${postData.approveCount}`, statsX, statsY);
    statsX += statsGap;
  }
  if (postData.starCount === 0 && postData.coffeeCount === 0 && postData.approveCount === 0) {
    ctx.fillText("💬 New post", statsX, statsY);
  }

  return canvas.toBuffer("image/png");
}

/**
 * Creates a fallback "not found" image
 */
export function createNotFoundImage(
  type: "user" | "post",
  size: { width: number; height: number } = ogImageSize,
): Buffer {
  const canvas = createCanvas(size.width, size.height);
  const ctx = canvas.getContext("2d");

  // Set up canvas
  ctx.textBaseline = "top";
  ctx.font = "32px system-ui, sans-serif";

  // Create gradient background
  createGradientBackground(ctx, size.width, size.height);

  // Draw not found content
  ctx.fillStyle = "white";
  ctx.font = "bold 72px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(type === "user" ? "👤" : "📝", size.width / 2, 200);

  ctx.font = "bold 48px system-ui, sans-serif";
  ctx.fillText(`${type === "user" ? "User" : "Post"} Not Found`, size.width / 2, 300);

  ctx.font = "32px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillText("ByteBuzz", size.width / 2, 380);

  return canvas.toBuffer("image/png");
}
