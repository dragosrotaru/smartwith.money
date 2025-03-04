'use client'

import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignInEmail() {
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const handleEmailLogin = async (formData: FormData) => {
    setIsEmailLoading(true)
    try {
      await signIn('postmark', { redirect: true, redirectTo: '/', email: formData.get('email') })
    } finally {
      setIsEmailLoading(false)
    }
  }
  return (
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
  )
}
