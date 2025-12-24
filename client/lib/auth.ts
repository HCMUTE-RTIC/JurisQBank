import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

// Define custom types for User and Session if needed,
// usually done in types/next-auth.d.ts but quick interfaces here help understanding

function randomHex(bytes: number) {
  const cryptoObj = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (!cryptoObj?.getRandomValues) return undefined;

  const buffer = new Uint8Array(bytes);
  cryptoObj.getRandomValues(buffer);
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const devFallbackSecret =
  process.env.NODE_ENV === "development" &&
  !(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
    ? randomHex(32)
    : undefined;

export const config = {
  debug: process.env.NODE_ENV === "development",
  // Avoid "UntrustedHost" errors in local dev/proxy setups.
  // If you deploy behind a proxy, this usually needs to stay enabled.
  trustHost: true,
  // Prod should set a stable secret via env; dev can use a per-process fallback.
  secret:
    process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? devFallbackSecret,
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
          if (!credentials?.email || !credentials?.password) return null;

          const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (!res.ok) {
            console.error("Django Auth Failed:", data);
            throw new Error(data?.detail || "Authentication Failed");
          }

          // Django returns: { tokens: { access, refresh }, user: { ... } }
          if (data.tokens && data.user) {
            return {
              ...data.user,
              accessToken: data.tokens.access,
              refreshToken: data.tokens.refresh,
            };
          }

          return null;
        } catch (error) {
          // Return null or throw error depending on NextAuth version preference
          // v5 usually prefers returning null or throwing standard Error
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in: merge user payload (includes unit) into JWT
      if (user) {
        return {
          ...token,
          ...user,
        };
      }

      // Client-driven session update (useSession().update)
      if (trigger === "update" && session?.user) {
        const updated = session.user as unknown as {
          unit?: string;
          full_name?: string;
        };
        return {
          ...token,
          ...(updated.unit !== undefined ? { unit: updated.unit } : {}),
          ...(updated.full_name !== undefined
            ? { full_name: updated.full_name }
            : {}),
        };
      }

      return token;
    },
    async session({ session, token }) {
      // Expose tokens + profile fields to the client session
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.full_name as string,
          full_name: token.full_name as string,
          role: token.role as string,
          unit: token.unit as string | undefined,
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
