import { UserProfile } from "@clerk/nextjs";
import { withAnalytics } from "@/lib/with-analytics";

function UserProfilePage() {
  return (
    <UserProfile
      appearance={{
        elements: {
          rootBox: "max-w-full h-full!",
          cardBox: "max-w-full! text-[inherit]! [&_*]:text-[inherit]! shadow-[none]! h-full!",
          navbar: "[background:inherit!important] [&_*]:[background:inherit!important] p-0!",
          scrollBox: "[background:inherit!important] [&_*]:[background:inherit!important]",
        },
      }}
    />
  );
}

export default withAnalytics(UserProfilePage, { event: "page-view" });
