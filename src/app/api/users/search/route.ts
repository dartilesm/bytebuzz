import { getCachedUsers } from "@/lib/db/calls/get-users";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("searchTerm");
  const users = await getCachedUsers(searchTerm as string, 10);
  return NextResponse.json(users);
}
