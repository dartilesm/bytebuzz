import "server-only";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { sendPageViewEvent } from "@/lib/analytics/page-view.events";
export async function getIp(headerList: Headers) {
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) return realIp.trim();

  return "";
}

interface WithAnalyticsProps {
  event: "page-view";
}

export function withAnalytics<P>(
  PageComponent: (props: P) => ReactNode,
  { event = "page-view" }: WithAnalyticsProps = {} as WithAnalyticsProps,
) {
  return async function AnalyticsWrapper(props: P) {
    const headerList = await headers();
    const ip = await getIp(headerList);

    if (event === "page-view") sendPageViewEvent({ ip, headerList });

    return PageComponent(props);
  };
}
