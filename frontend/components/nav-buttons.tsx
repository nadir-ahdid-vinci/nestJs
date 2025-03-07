"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { useState } from "react"
import { hasRequiredRole, ROLES } from "@/lib/roles"

interface NavButtonsProps {
  isLoggedIn: boolean
  userName?: string
  userRole?: string
}

export function NavButtons({ isLoggedIn, userName, userRole }: NavButtonsProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    router.push("/login")
    setIsLoggingOut(false)
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-4">
        {userName && <span className="text-sm">Bonjour, {userName}</span>}

        {/* Afficher le lien vers les applications si l'utilisateur a le rôle requis */}
        {userRole && hasRequiredRole(userRole, ROLES.HUNTER_DEV) && (
          <Button variant="ghost" asChild>
            <Link href="/application">Applications</Link>
          </Button>
        )}

        {/* Afficher le lien vers l'admin si l'utilisateur a le rôle requis */}
        {userRole && hasRequiredRole(userRole, ROLES.HUNTER_ADMIN) && (
          <Button variant="ghost" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
        )}

        <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <Button asChild>
        <Link href="/login">Se connecter</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/admin">Admin</Link>
      </Button>
    </div>
  )
}

