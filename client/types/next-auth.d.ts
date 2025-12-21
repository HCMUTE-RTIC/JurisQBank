
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      accessToken: string
      refreshToken: string
      full_name?: string
    } & DefaultSession["user"]
  }

  interface User {
      id: string
      role: string
      full_name?: string
      accessToken: string
      refreshToken: string
  }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        accessToken: string
        refreshToken: string
        full_name?: string
    }
}
