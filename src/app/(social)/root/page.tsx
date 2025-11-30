import { UserFeed } from "@/components/containers/user-feed";
import { log } from "@/lib/logger/logger";
import { withAnalytics } from "@/lib/with-analytics";

function Home() {
  log.info("Home page loaded");
  return <UserFeed />;
}

export default withAnalytics(Home, { event: "page-view" });
