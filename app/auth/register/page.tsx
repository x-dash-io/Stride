'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /[0-9]/.test(formData.password) },
  ]

  const allRequirementsMet = passwordRequirements.every((r) => r.met)
  const passwordsMatch = formData.password === formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (!allRequirementsMet) {
      setError('Password does not meet requirements')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    try {
      await register(formData.name, formData.email, formData.password)
      router.push('/account')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-2">Join STRIDE</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive text-sm rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="text-sm font-semibold block mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                className="input-base pl-10"
              />
            </div>
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

            {/* Password Requirements */}
            <div className="mt-3 space-y-2">
              {passwordRequirements.map((req, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-sm ${
                    req.met ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{req.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirm" className="text-sm font-semibold block mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                className="input-base pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && (
              <p className={`mt-2 text-sm ${passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) =>
                setFormData({ ...formData, acceptTerms: e.target.checked })
              }
              className="w-4 h-4 mt-1"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
              I agree to the{' '}
              <Link href="#" className="text-accent hover:underline">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-accent hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !allRequirementsMet || !passwordsMatch || !formData.acceptTerms}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-accent hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
