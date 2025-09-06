import { ExploreView } from "@/components/containers/explore-view";
import { withAnalytics } from "@/lib/with-analytics";
function ExplorePage() {
  return <ExploreView />;
}

export default withAnalytics(ExplorePage, { event: "page-view" });
