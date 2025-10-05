import { PromotedAd } from "@/components/promoted-ad";
import { UserToFollowList } from "@/components/user-to-follow-list";
import { createServerSupabaseClient } from "@/db/supabase";

async function getRandomUnfollowedUsers() {
  const supabaseClient = createServerSupabaseClient();

  const randomeUnfollwedUsers = await supabaseClient.rpc("get_random_unfollowed_users", {
    count: 3,
  });

  return randomeUnfollwedUsers;
}

/**
 * A section that displays user suggestions and promoted content
 */
export async function SuggestionsSection() {
  const { data: users } = await getRandomUnfollowedUsers();
  return (
    <div className='space-y-4 max-w-80'>
      {/* Suggestions Card */}
      {!!users?.length && users.length > 0 && <UserToFollowList users={users} />}

      {/* Promoted Content */}
      <PromotedAd />

      {/* Footer Links */}
      <div className='text-sm text-default-500'>
        <div className='flex flex-wrap gap-2 mb-2'>
          <a href='#' className='hover:underline'>
            Terms
          </a>
          <span>·</span>
          <a href='#' className='hover:underline'>
            Privacy
          </a>
          <span>·</span>
          <a href='#' className='hover:underline'>
            Cookies
          </a>
          <span>·</span>
          <a href='#' className='hover:underline'>
            More
          </a>
        </div>
      </div>
    </div>
  );
}
