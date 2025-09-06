import { withAnalytics } from "@/lib/with-analytics";
import { notFound } from "next/navigation";

function MessagesPage() {
  return notFound();
}

export default withAnalytics(MessagesPage, { event: "page-view" });
