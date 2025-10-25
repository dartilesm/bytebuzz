import { UserFeed } from "@/components/containers/user-feed";
import { sendPageViewEvent } from "@/lib/analytics/page-view.events";
import { headers } from "next/headers";
import { getIp } from "@/lib/with-analytics";
import { auth } from "@clerk/nextjs/server";

async function Home() {
  // Get headers outside of any cached scope
  const headerList = await headers();
  const ip = await getIp(headerList);

  // Send analytics event
  sendPageViewEvent({ ip, headerList });

  // Get access token outside of cache scope
  const accessToken = await (await auth()).getToken();

  return <UserFeed accessToken={accessToken} />;
}

export default Home;
