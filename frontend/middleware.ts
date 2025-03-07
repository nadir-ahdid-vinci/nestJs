import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { hasRequiredRole, ROLES } from "./lib/roles"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session-token")?.value

  // Vérifier les routes protégées
  const protectedRoutes = [
    { path: "/admin", requiredRole: ROLES.HUNTER_ADMIN },
    { path: "/dev", requiredRole: ROLES.HUNTER_DEV },
    { path: "/hunter", requiredRole: ROLES.HUNTER },
    { path: "/application", requiredRole: ROLES.HUNTER_DEV },
  ]

  // Trouver la route protégée correspondante
  const matchedRoute = protectedRoutes.find((route) => request.nextUrl.pathname.startsWith(route.path))

  if (matchedRoute) {
    if (!token) {
      // Rediriger vers la page de connexion si aucun token n'existe
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      // Vérifier le token et le rôle de l'utilisateur
      const response = await fetch(`${process.env.API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      const userData = await response.json()

      // Vérifier si l'utilisateur a le rôle requis
      if (!hasRequiredRole(userData.role, matchedRoute.requiredRole)) {
        // Rediriger vers la page d'accueil si l'utilisateur n'a pas le rôle requis
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

// Configurer le middleware pour s'exécuter sur les chemins spécifiques
export const config = {
  matcher: ["/admin/:path*", "/dev/:path*", "/hunter/:path*", "/application/:path*"],
}

