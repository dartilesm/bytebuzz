const otelCollectorUrl = process.env.NEXT_PUBLIC_BETTERSTACK_ENDPOINT;

const headers = {
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_BETTERSTACK_SOURCE_TOKEN}`,
};

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
  }
}

export function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string; // resource path, e.g. /blog?name=foo
    method: string; // request method. e.g. GET, POST, etc
    headers: { [key: string]: string | string[] };
  },
  context: {
    routerKind: "Pages Router" | "App Router"; // the router type
    routePath: string; // the route file path, e.g. /app/blog/[dynamic]
    routeType: "render" | "route" | "action" | "middleware"; // the context in which the error occurred
    renderSource:
      | "react-server-components"
      | "react-server-components-payload"
      | "server-rendering";
    revalidateReason: "on-demand" | "stale" | undefined; // undefined is a normal request without revalidation
    renderType: "dynamic" | "dynamic-resume"; // 'dynamic-resume' for PPR
  },
) {
  const errorMessage = `Unhandled error in route "${context.routePath}" [${context.routeType}]: ${error?.message ?? "No error message provided"}`;
}
