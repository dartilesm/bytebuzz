import { type NextRequest, NextResponse } from "next/server";
import { getRealCustomEmojiUrl } from "@/lib/emojis/custom-emojis";

export async function GET(request: NextRequest, routeContext: RouteContext<"/api/emoji/[id]">) {
  const { id } = await routeContext.params;

  const realUrl = getRealCustomEmojiUrl(id);

  if (!realUrl) {
    return new NextResponse("Emoji not found", { status: 404 });
  }

  // Redirect to the real URL
  return NextResponse.redirect(realUrl);
}
