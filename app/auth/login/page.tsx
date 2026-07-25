'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      await login(formData.email, formData.password)
      router.push('/account')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your STRIDE account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive text-sm rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Demo Info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Demo Account:</p>
            <p>Email: demo@example.com</p>
            <p>Password: demo</p>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="text-sm font-semibold block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="hello@example.com"
                className="input-base pl-10"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="text-sm font-semibold block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                className="input-base pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input id="remember" type="checkbox" className="w-4 h-4" />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">
                New to STRIDE?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            href="/auth/register"
            className="btn-secondary w-full text-center block"
          >
            Create Account
          </Link>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2 text-sm">
          <Link href="#" className="block text-accent hover:underline">
            Forgot your password?
          </Link>
          <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
