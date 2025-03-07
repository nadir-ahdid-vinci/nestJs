import { getSession } from "@/lib/auth"
import { NavButtons } from "@/components/nav-buttons"

export default async function Home() {
  const session = await getSession()
  const isLoggedIn = !!session

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to My Application</h1>
        <p className="text-xl mb-8">This is a public page accessible to everyone</p>
        <div className="flex justify-center gap-4">
          <NavButtons isLoggedIn={isLoggedIn} userName={session?.user.name} />
        </div>
      </div>
    </main>
  )
}

