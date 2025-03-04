import NextAuth, { DefaultSession, NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Postmark from 'next-auth/providers/postmark'
import Apple from 'next-auth/providers/apple'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { userAccounts, authenticators, sessions, users, verificationTokens } from './modules/model'
import { db } from '@/lib/db'
import { menu } from './lib/menu'
import { recordReferralUse } from './modules/referral/service'
import { cookies } from 'next/headers'
import { REFERRAL_CODE_COOKIE_NAME } from '@/lib/constants'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      stripeCustomerId?: string | null
    } & DefaultSession['user']
  }
}

export const config: NextAuthConfig = {
  debug: process.env.NODE_ENV === 'development',
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: userAccounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  pages: {
    signIn: menu.signin.href,
    error: '/error',
    newUser: menu.onboarding.href,
  },
  events: {
    async createUser({ user }) {
      try {
        // Get referral code from cookie
        const cookieStore = await cookies()
        const referralCode = cookieStore.get(REFERRAL_CODE_COOKIE_NAME)

        if (referralCode && user.id) {
          // Record the referral use if valid
          const error = await recordReferralUse(referralCode.value, user.id)

          // Clear the cookie
          cookieStore.delete(REFERRAL_CODE_COOKIE_NAME)

          if (error instanceof Error) {
            console.log('Referral use already exists or db error', error.message)
          } else {
            console.log('Referral used:', referralCode.value)
          }
        }
      } catch (error) {
        console.error('Error in createUser event:', error)
      }
    },
  },
  callbacks: {
    async signIn() {
      // todo update last active
      return true
    },
    async session({ session, user }) {
      /* // todo enable sentry 
       const scope = Sentry.getCurrentScope()
 
      scope.setUser({
        id: user.id,
        email: user.email,
      })
      */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...session, user: { ...session.user, id: user.id, stripeCustomerId: (user as any).stripeCustomerId } }
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({}),
    Apple({}),
    Postmark({
      from: process.env.POSTMARK_FROM_EMAIL!,
      apiKey: process.env.POSTMARK_API_KEY!,
    }),
  ],
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
