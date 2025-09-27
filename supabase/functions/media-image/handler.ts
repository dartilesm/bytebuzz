import { fetchPostData } from "./utils/fetch-post-data.ts";
import { fetchUserData } from "./utils/fetch-user-data.ts";
import {
  createErrorImage,
  createNotFoundImage,
  createPostThreadImage,
  createUserProfileImage,
} from "./utils/image-generators.tsx";

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
