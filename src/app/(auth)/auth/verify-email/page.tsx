import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address to complete registration',
};

export default function VerifyEmailPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We've sent you a verification link to complete your registration
        </p>
      </div>
      
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">Verification email sent</CardTitle>
          <CardDescription>
            Please check your email inbox and click the verification link to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
          <div className="rounded-full bg-primary/10 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>Didn't receive an email? Check your spam folder or try signing up with a different email address.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Return to login</Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
} 