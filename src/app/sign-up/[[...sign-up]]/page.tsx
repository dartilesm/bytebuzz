import { withAnalytics } from "@/lib/with-analytics";
import { SignUp } from "@clerk/nextjs";

async function SignUpPage({ searchParams }: PageProps<"/sign-up/[[...sign-up]]">) {
  const { redirectUrl } = await searchParams;

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
      <SignUp fallbackRedirectUrl={(redirectUrl as string) || "/"} />
    </div>
  );
}

export default withAnalytics(SignUpPage, { event: "page-view" });
