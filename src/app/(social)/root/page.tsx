import { UserFeed } from "@/components/containers/user-feed";
import { withAnalytics } from "@/lib/with-analytics";
import { log } from "@/lib/logger/logger";

function Home() {
  log.info("Home page loaded");
  return <UserFeed />;
}

export default withAnalytics(Home, { event: "page-view" });
