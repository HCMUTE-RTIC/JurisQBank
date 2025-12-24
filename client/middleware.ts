
import { auth } from "@/lib/auth"
 
export default auth((req) => {
  // Simplest middleware: just protect everything by default or selective?
  // For now, let's just log or basic check. 
  // NextAuth v5 middleware is essentially a wrapper.

  const pathname = req.nextUrl.pathname
  
  const isLoggedIn = !!req.auth?.user
  const hasUpdatedInfo = !!req.auth?.user?.unit

  const isOnUpdateInfo = pathname.startsWith("/update-info")
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnAuth = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoggedIn && !hasUpdatedInfo && !isOnUpdateInfo) {
    return Response.redirect(new URL("/update-info", req.nextUrl))
  }

  if (isLoggedIn && hasUpdatedInfo && isOnUpdateInfo) {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
