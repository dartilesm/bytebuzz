import { isDomainAllowed } from "@/lib/analytics/domain-check";
import { log } from "../logger/logger";


interface PageViewEventData {
  ip: string;
  headerList: Headers;
}

export async function sendPageViewEvent(data: PageViewEventData) {
  const url = data.headerList.get("x-full-url") || "";
  const userAgent = data.headerList.get("user-agent") || "";

  if (!isDomainAllowed({ url, userAgent })) {
    return;
  }

  const pageInfo = {
    url,
    ip: data.ip,
    user_agent: userAgent,
    accept_language: data.headerList.get("accept-language") || "",
    sec_ch_ua: data.headerList.get("sec-ch-ua") || "",
    sec_ch_ua_mobile: data.headerList.get("sec-ch-ua-mobile") || "",
    sec_ch_ua_platform: data.headerList.get("sec-ch-ua-platform") || "",
    sec_ch_ua_platform_version: data.headerList.get("sec-ch-ua-platform-version") || "",
    sec_ch_width: data.headerList.get("sec-ch-width") || "",
    sec_ch_viewport_width: data.headerList.get("sec-ch-viewport-width") || "",
    referrer: data.headerList.get("referer") || "",
    tags: {},
  };

  try {
    const response = await fetch(`${process.env.PIRSCH_API_URL}/hit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PIRSCH_ACCESS_KEY}`,
      },
      body: JSON.stringify(pageInfo),
    });
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    log.info("Page view analytics response", { pageViewAnalyticsResponse: response });
  } catch (error) {
    log.error("Error sending page view analytics", { error });
  }
}
