import { NextResponse } from "next/server";
import { emojiService } from "@/lib/db/services/emoji.service";

export async function GET() {
  const emojis = await emojiService.getAllCustomEmojis();
  return NextResponse.json(emojis);
}
