import { withAnalytics } from "@/lib/with-analytics";
import { SignIn } from "@clerk/nextjs";

async function SignInPage({ searchParams }: PageProps<"/sign-in/[[...sign-in]]">) {
  const { redirectUrl } = await searchParams;

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
      <SignIn fallbackRedirectUrl={(redirectUrl as string) || "/"} />
    </div>
  );
}

export default withAnalytics(SignInPage, { event: "page-view" });
