"use client";

import { addToast, HeroUIProvider, ToastProvider } from "@heroui/react";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      addToast({
        title: "Oh no! Something went wrong",
        description: error.message,
        color: "danger",
      });
    },
  }),
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <ToastProvider />
        {children}
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
