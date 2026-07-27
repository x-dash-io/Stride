'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const errorMessages: Record<string, { title: string; message: string }> = {
  OAuthSignin: { title: 'Sign In Error', message: 'There was a problem starting the sign in process. Please try again.' },
  OAuthCallback: { title: 'Callback Error', message: 'There was a problem processing the sign in callback. Please try again.' },
  OAuthCreateAccount: { title: 'Account Creation Error', message: 'There was a problem creating your account. Please try again.' },
  EmailCreateAccount: { title: 'Account Creation Error', message: 'There was a problem creating your account. Please try again.' },
  Callback: { title: 'Callback Error', message: 'There was a problem processing the authentication callback.' },
  OAuthAccountNotLinked: { title: 'Account Not Linked', message: 'This email is already associated with another sign in method. Please sign in using your original method.' },
  EmailSignin: { title: 'Email Sign In Error', message: 'There was a problem sending the sign in email. Please try again.' },
  CredentialsSignin: { title: 'Invalid Credentials', message: 'The email or password you entered is incorrect. Please try again.' },
  SessionRequired: { title: 'Session Required', message: 'Please sign in to access this page.' },
  default: { title: 'Authentication Error', message: 'An unexpected authentication error occurred. Please try again.' },
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'default'
  const { title, message } = errorMessages[error] || errorMessages.default

  return (
    <div className="container-max py-12 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">{title}</CardTitle>
          <CardDescription className="text-base mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {error === 'OAuthAccountNotLinked' && (
            <p className="text-sm text-muted-foreground mb-4">
              Try signing in with Google or the provider you used previously.
            </p>
          )}
          {error === 'CredentialsSignin' && (
            <p className="text-sm text-muted-foreground mb-4">
              <Link href="/auth/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth/login">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="container-max py-12 min-h-screen flex items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
