import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function AdminPage() {
  const session = await getSession()

  // Check if user is authenticated and has admin role
  if (!session || session.user.role !== "HUNTER_ADMIN") {
    redirect("/login?error=unauthorized")
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-xl mb-8">Welcome, {session.user.name}!</p>
        <p>This page is only accessible to users with the admin role.</p>
      </div>
    </main>
  )
}

