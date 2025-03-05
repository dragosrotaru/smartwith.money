import { Suspense } from 'react'
import { menu } from '@/lib/menu'
import ShowReferralMessage from './ShowReferralMessage'
import SignInGoogle from './SignInGoogle'
import SignInApple from './SignInApple'
import SignInFacebook from './SigninFacebook'
import SignInEmail from './SignInEmail'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect('/')

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-card text-card-foreground rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Sign in or create an account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Smartwith.money is free. If you like the site, you can upgrade for pro features. If you dont, you can export
          your data and delete your account anytime.
        </p>
      </div>

      <Suspense>
        <ShowReferralMessage />
      </Suspense>

      <div className="space-y-6 mt-6">
        <SignInEmail />

        <div className="relative flex flex-col gap-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <SignInGoogle />
          <SignInApple />
          <SignInFacebook />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        By continuing, you agree to our{' '}
        <Link href={menu.termsOfService.href} className="text-primary hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href={menu.privacyPolicy.href} className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
