import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <LoginForm />
      </div>
    </main>
  )
}

