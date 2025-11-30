import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const { redirectUrl } = await searchParams;

  return <SignUp oauthFlow='popup' fallbackRedirectUrl={(redirectUrl as string) || "/"} />;
}
