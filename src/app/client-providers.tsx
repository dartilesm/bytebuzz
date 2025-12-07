"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ContentViewerProvider } from "@/context/content-viewer-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 60 * 1000, // 1 minute
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error("Oh no! Something went wrong", {
        description: error.message,
      });
    },
  }),
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ContentViewerProvider>
          <Toaster richColors />
          {children}
        </ContentViewerProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
