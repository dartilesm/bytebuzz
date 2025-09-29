import { createServerSupabaseClient } from "@/db/supabase";
import { type NextRequest, NextResponse } from "next/server";

async function getUsers(searchTerm: string) {
  if (!searchTerm) {
    return { data: [] };
  }

  const supabaseClient = createServerSupabaseClient();

  const randomeUnfollwedUsers = await supabaseClient.rpc("search_users", {
    search_term: searchTerm,
    limit_count: 10,
  });

  return randomeUnfollwedUsers;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("searchTerm");
  const users = await getUsers(searchTerm as string);
  return NextResponse.json(users);
}
