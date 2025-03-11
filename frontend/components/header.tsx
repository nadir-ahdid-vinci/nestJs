import Link from "next/link"
import { getSession } from "@/lib/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavMenu } from "@/components/nav-menu"
import { hasRequiredRole, ROLES } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logout } from "@/lib/auth"

export async function Header() {
  const session = await getSession()
  const isLoggedIn = !!session

  // Définir les menus de navigation
  const hunterMenu = {
    title: "Hunter",
    items: [{ title: "Applications", href: "/hunter/applications" }],
  }

  const devMenu = {
    title: "Dev",
    items: [{ title: "Applications", href: "/dev/applications" }],
  }

  const adminMenu = {
    title: "Admin",
    items: [
      { title: "Applications", href: "/admin/applications" },
      { title: "Récompenses", href: "/admin/rewards" },
    ],
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
      <div className="flex">
        <Link href="/" className="flex items-center space-x-2">
        <span className="font-bold text-xl">HunterApp</span>
        </Link>
      </div>

      {isLoggedIn && (
        <nav className="flex items-center gap-2 text-sm">
        {/* Menu Hunter (visible par tous) */}
        <NavMenu title={hunterMenu.title} items={hunterMenu.items} />

        {/* Menu Dev (visible par Dev et Admin) */}
        {session.user.role && hasRequiredRole(session.user.role, ROLES.HUNTER_DEV) && (
          <NavMenu title={devMenu.title} items={devMenu.items} />
        )}

        {/* Menu Admin (visible uniquement par Admin) */}
        {session.user.role && hasRequiredRole(session.user.role, ROLES.HUNTER_ADMIN) && (
          <NavMenu title={adminMenu.title} items={adminMenu.items} />
        )}
        </nav>
      )}

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {isLoggedIn ? (
        <form action={logout}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Se déconnecter">
          <LogOut className="h-5 w-5" />
          </Button>
        </form>
        ) : (
        <Button asChild variant="default" size="sm">
          <Link href="/login">Se connecter</Link>
        </Button>
        )}
      </div>
      </div>
    </header>
  )
}

