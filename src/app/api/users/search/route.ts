import { type NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/db/services/user.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("searchTerm");
  const users = await userService.searchUsers({
    searchTerm: searchTerm as string,
    limitCount: 10,
    offsetCount: 0,
  });
  return NextResponse.json(users);
}
