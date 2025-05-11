import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
      <SignUp />
    </div>
  );
}
