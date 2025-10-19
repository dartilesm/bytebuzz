import { UserFeed } from "@/components/containers/user-feed";
import { log } from "@/lib/logger";
import { withAnalytics } from "@/lib/with-analytics";

function Home() {
  log.info("Home root");
  return <UserFeed />;
}

export default withAnalytics(Home, { event: "page-view" });
