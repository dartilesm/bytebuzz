import { withAnalytics } from "@/lib/with-analytics";
import { SignIn } from "@clerk/nextjs";

function SignInPage() {
  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
      <SignIn />
    </div>
  );
}

export default withAnalytics(SignInPage, { event: "page-view" });
