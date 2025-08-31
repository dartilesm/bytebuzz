import { Sidebar } from "@/components/sidebar/sidebar";
import { SuggestionsSection } from "@/components/suggestions/suggestions-section";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid grid-cols-[max-content_600px_max-content] gap-4 mx-auto justify-center w-full container">
      <div className="flex flex-col gap-4 sticky top-0 max-h-dvh">
        <Sidebar />
      </div>
      <div className="flex flex-col min-h-dvh">{children}</div>
      <div className="flex flex-col gap-4 sticky top-4 h-fit">
        <SuggestionsSection />
      </div>
    </main>
  );
}
