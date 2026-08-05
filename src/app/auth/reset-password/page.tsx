'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const PASSWORD_HINT = 'At least 8 characters with uppercase, lowercase and a number.'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDone, setIsDone] = useState(false)

  const validate = () => {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'Password must include uppercase, lowercase and a number'
    if (password !== confirmPassword) return 'Passwords do not match'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }
      setIsDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Invalid Link</CardTitle>
          <CardDescription className="text-base mt-2">
            This password reset link is missing or malformed.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth/forgot-password">Request a new link</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (isDone) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Password Updated</CardTitle>
          <CardDescription className="text-base mt-2">
            Your password has been reset successfully. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-serif">Set a New Password</CardTitle>
        <CardDescription>{PASSWORD_HINT}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !password || !confirmPassword}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/auth/login" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="container-max py-12 min-h-screen flex items-center justify-center">
      <Suspense fallback={<Card className="w-full max-w-md"><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
