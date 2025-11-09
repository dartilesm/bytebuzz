import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/sidebar/mobile-bottom-nav";
import { AuthContextProvider } from "@/context/auth-context";
import { withAnalytics } from "@/lib/with-analytics";
import { currentUser } from "@clerk/nextjs/server";
import { serializeUser } from "@/lib/auth/serialize-user";
import { detectMobileFromHeaders } from "@/lib/device/detect-mobile";

async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const serializedUser = serializeUser(user);
  const isMobile = await detectMobileFromHeaders();

  return (
    <AuthContextProvider initialUser={serializedUser} initialIsMobile={isMobile}>
      <main className='grid grid-cols-1 md:grid-cols-[max-content_1fr] gap-4 px-2 md:px-4 mx-auto w-full max-w-7xl pb-16 md:pb-0'>
        <div className='hidden md:flex flex-col gap-4 sticky top-0 max-h-dvh'>
          <Sidebar />
        </div>
        <div className='flex flex-col gap-4 min-h-dvh p-2 md:p-4'>{children}</div>
      </main>
      <MobileBottomNav />
    </AuthContextProvider>
  );
}

export default withAnalytics(AuthenticatedLayout, { event: "page-view" });
