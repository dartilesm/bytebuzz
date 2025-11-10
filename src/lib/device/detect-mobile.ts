import { headers } from "next/headers";

/**
 * Detects if the current request is from a mobile device based on User-Agent header.
 * This function should only be called in Server Components or Server Actions.
 *
 * @returns true if the User-Agent indicates a mobile device, false otherwise
 */
export async function detectMobileFromHeaders(): Promise<boolean> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  // Match common mobile device patterns
  // This regex matches: Mobile, Android, iPhone, iPad, iPod, BlackBerry, IEMobile, Opera Mini
  return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}
