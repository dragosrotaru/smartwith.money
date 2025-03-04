import { signIn } from 'next-auth/react'

export const handleLogin = async (provider: string) => {
  await signIn(provider, { redirect: true, redirectTo: '/' })
}
