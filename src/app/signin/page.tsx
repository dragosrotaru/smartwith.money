'use client'
import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { useReferralCode } from '@/hooks/use-referral-code'
import Loader from '@/components/Loader'
import { menu } from '@/lib/menu'

export default function LoginPage() {
  const { status } = useSession()
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const { referralCode } = useReferralCode()

  useEffect(() => {
    if (status === 'authenticated') {
      redirect('/')
    }
  }, [status])

  const redirectTo = '/'
  const handleEmailLogin = async (formData: FormData) => {
    setIsEmailLoading(true)
    try {
      await signIn('postmark', { redirect: true, redirectTo, email: formData.get('email') })
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleLogin = async (provider: string) => {
    await signIn(provider, { redirect: true, redirectTo })
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-card text-card-foreground rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Sign in or create an account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Smartwith.money is free. If you like the site, you can upgrade for pro features. If you dont, you can export
          your data and delete your account anytime.
        </p>
      </div>

      {referralCode && (
        <div className="my-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-primary">
            You&apos;ve been invited! If you decide to upgrade later, you and your friend will get one month free, on
            top of our 1 month free trial.
          </p>
        </div>
      )}

      <div className="space-y-6 mt-6">
        {/* Email/Password Form */}
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            await handleEmailLogin(formData)
          }}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-10" disabled={isEmailLoading}>
            {isEmailLoading ? (
              <>
                <Loader />
                Sending link...
              </>
            ) : (
              'Sign in with email link'
            )}
          </Button>
        </form>

        <div className="relative flex flex-col gap-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <form action={() => handleLogin('google')}>
            <Button type="submit" variant="outline" className="w-full h-10 flex justify-center items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>

          {/* Apple Sign In */}
          <form action={() => handleLogin('apple')}>
            <Button type="submit" variant="outline" className="w-full h-10 flex justify-center items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              Sign in with Apple
            </Button>
          </form>

          {/* Facebook Sign In */}
          <form action={() => handleLogin('facebook')}>
            <Button type="submit" variant="outline" className="w-full h-10 flex justify-center items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              Sign in with Facebook
            </Button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        By continuing, you agree to our{' '}
        <a href={menu.termsOfService.href} className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href={menu.privacyPolicy.href} className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
