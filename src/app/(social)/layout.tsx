import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/sidebar/mobile-bottom-nav";
import { SuggestionsSection } from "@/components/suggestions/suggestions-section";

/**
 * Layout for the social section. Renders the main chrome and an optional `@modal` parallel route
 * as an overlay. Required for intercepted routes like `(.)sign-in` and `(.)sign-up` to display
 * over the current page during soft navigation.
 */
export default function AuthenticatedLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <>
      <main className='grid grid-cols-1 md:grid-cols-[max-content_600px] lg:grid-cols-[max-content_600px_max-content] gap-4 mx-auto justify-center w-full md:container px-0 md:px-4 pb-16 md:pb-0'>
        <div className='hidden md:flex flex-col gap-4 sticky top-0 max-h-dvh'>
          <Sidebar />
        </div>
        <div className='flex flex-col min-h-dvh w-full max-w-full md:max-w-[600px] md:border-x-1 border-x-content2/80'>
          {modal}
          {children}
        </div>
        <div className='hidden lg:flex flex-col gap-4 sticky top-4 h-fit'>
          <SuggestionsSection />
        </div>
      </main>
      <MobileBottomNav />
    </>
  );
}
