import { notFound } from "next/navigation";
import { withAnalytics } from "@/lib/with-analytics";

function MessagesPage() {
  return notFound();
}

export default withAnalytics(MessagesPage, { event: "page-view" });
