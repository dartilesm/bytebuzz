import { SignIn } from "@clerk/nextjs";

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { redirectUrl } = await searchParams;

  return <SignIn oauthFlow='popup' fallbackRedirectUrl={(redirectUrl as string) || "/"} />;
}
