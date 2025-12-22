
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

// Define custom types for User and Session if needed, 
// usually done in types/next-auth.d.ts but quick interfaces here help understanding

export const config = {
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          })

          const data = await res.json()

          if (!res.ok) {
            console.error("Django Auth Failed:", data)
            throw new Error(data?.detail || "Authentication Failed")
          }

          // Django returns: { tokens: { access, refresh }, user: { ... } }
          if (data.tokens && data.user) {
            return {
              ...data.user,
              accessToken: data.tokens.access,
              refreshToken: data.tokens.refresh,
            }
          }

          return null
        } catch (error) {
            // Return null or throw error depending on NextAuth version preference
            // v5 usually prefers returning null or throwing standard Error
            console.error("Auth Error:", error)
            return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        return {
            ...token,
            ...user, // Merge user data (including tokens) into JWT
        }
      }
      return token
    },
    async session({ session, token }) {
      // Expose tokens and user details to the client session
      if(token) {
        session.user = {
            ...session.user,
            id: token.id as string,
            email: token.email as string,
            name: token.full_name as string,
            role: token.role as string,
            accessToken: token.accessToken as string,
            refreshToken: token.refreshToken as string,
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
