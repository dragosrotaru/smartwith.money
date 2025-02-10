import NextAuth, { DefaultSession, NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Postmark from 'next-auth/providers/postmark'
import Apple from 'next-auth/providers/apple'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { userAccounts, authenticators, sessions, users, verificationTokens } from './modules/model'
import { db } from './lib/db'
import { menu } from './lib/menu'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
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
    signIn: menu.login.href,
    error: '/error',
    newUser: menu.onboarding.href,
  },
  callbacks: {
    async session({ session, user }) {
      /* // todo enable sentry 
       const scope = Sentry.getCurrentScope()
 
      scope.setUser({
        id: user.id,
        email: user.email,
      })
      */
      return { ...session, user: { ...session.user, id: user.id } }
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
      from: 'auth@smartwith.money',
      apiKey: process.env.POSTMARK_API_KEY,
    }),
  ],
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
