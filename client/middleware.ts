
import { auth } from "@/lib/auth"

export default auth((req) => {
  // Simplest middleware: just protect everything by default or selective?
  // For now, let's just log or basic check. 
  // NextAuth v5 middleware is essentially a wrapper.

  const pathname = req.nextUrl.pathname

  const isLoggedIn = !!req.auth?.user
  const hasUpdatedInfo = !!req.auth?.user?.unit || true // TEMPORARY: allow bypassing update-info for testing
  const isAdmin = !!req.auth?.user?.role

  const isOnUpdateInfo = pathname.startsWith("/update-info")
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

  // const isOnAdmin = pathname.startsWith("/admin")
  // if (isOnAdmin && !isAdmin) {
  //   return Response.redirect(new URL('/dashboard', req.nextUrl))
  // }
  // if (isLoggedIn && isAdmin && !isOnAdmin) {
  //   return Response.redirect(new URL('/admin/dashboard', req.nextUrl))
  // }

  // if (isOnAdmin && !isAdmin) {
  //   return Response.redirect(new URL('/dashboard', req.nextUrl))
  // }


  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoggedIn && !hasUpdatedInfo && !isOnUpdateInfo && !isAdmin) {
    return Response.redirect(new URL("/update-info", req.nextUrl))
  }

  if (isLoggedIn && hasUpdatedInfo && isOnUpdateInfo) {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
