import { type NextRequest, NextResponse } from "next/server";
import { emojiService } from "@/lib/db/services/emoji.service";

export async function GET(request: NextRequest, routeContext: RouteContext<"/api/emoji/[id]">) {
  const { id } = await routeContext.params;
  const emoji = await emojiService.getCustomEmoji(id);

  if (!emoji) {
    return new NextResponse("Emoji not found", { status: 404 });
  }

  return NextResponse.json(emoji);

  // Redirect to the emoji source URL
  // return NextResponse.redirect(emoji.src);
}
