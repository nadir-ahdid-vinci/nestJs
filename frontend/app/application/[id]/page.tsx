import { getSession } from '@/lib/auth'
import { hasRequiredRole, ROLES } from "@/lib/roles"
import { redirect } from 'next/navigation'
import { getApplication } from '@/lib/applications'
import { Application } from "@/components/application"

export default async function ApplicationPage({ params }: { params: { id: string } }) {
    const session = await getSession()
    if (!session || !hasRequiredRole(session.user.role, ROLES.HUNTER)) {
        redirect("/login?error=unauthorized")
        
    }

    const application = await getApplication(+params.id)
    
    return (
        <main className="flex min-h-screen flex-col p-8">
            <div className="max-w-7xl w-full mx-auto">
            <h1 className="text-3xl font-bold mb-6">Applications Hunter</h1>
            <p className="text-xl mb-8">
                Bienvenue, {session.user.name}! Voici la liste des applications disponibles pour les hunters.
            </p>
    
            {application ? (
                <Application application={application} />
            ) : (
                <p>Application not found.</p>
            )}
            </div>
        </main>
        );
}