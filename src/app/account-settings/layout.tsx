import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/sidebar/mobile-bottom-nav";
import { Section } from "@/components/ui/container";
import { NavigationContextProvider } from "@/context/navigation-context";
import { withAnalytics } from "@/lib/with-analytics";
import { currentUser } from "@clerk/nextjs/server";
import { serializeUser } from "@/lib/auth/serialize-user";
import { detectMobileFromHeaders } from "@/lib/device/detect-mobile";

async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const serializedUser = serializeUser(user);
  const isMobile = await detectMobileFromHeaders();

  return (
    <NavigationContextProvider initialUser={serializedUser} initialIsMobile={isMobile}>
      <main className="grid grid-cols-1 md:grid-cols-[max-content_1fr] gap-4 px-2 md:px-4 mx-auto w-full max-w-7xl pb-12 md:pb-0">
        <div className="hidden md:flex flex-col gap-4 sticky top-0 max-h-dvh">
          <Sidebar />
        </div>
        <Section className="flex flex-col gap-4 min-h-dvh">{children}</Section>
      </main>
      <MobileBottomNav />
    </NavigationContextProvider>
  );
}

export default withAnalytics(AuthenticatedLayout, { event: "page-view" });
