import { Sidebar } from "@/components/sidebar/sidebar";
import { SuggestionsSection } from "@/components/suggestions/suggestions-section";

/**
 * Layout for the social section. Renders the main chrome and an optional `@modal` parallel route
 * as an overlay. Required for intercepted routes like `(.)sign-in` and `(.)sign-up` to display
 * over the current page during soft navigation.
 */
export default function AuthenticatedLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <main className="grid grid-cols-[max-content_600px_max-content] gap-4 mx-auto justify-center w-full container">
      <div className="flex flex-col gap-4 sticky top-0 max-h-dvh">
        <Sidebar />
      </div>
      <div className="flex flex-col min-h-dvh">
        {modal}
        {children}
      </div>
      <div className="flex flex-col gap-4 sticky top-4 h-fit">
        <SuggestionsSection />
      </div>
    </main>
  );
}
