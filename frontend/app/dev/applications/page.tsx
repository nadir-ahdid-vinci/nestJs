import { getApplications } from "@/lib/applications";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasRequiredRole, ROLES } from "@/lib/roles";
import { ApplicationList } from "@/components/application-list";

export default async function DevApplicationsPage() {
  const session = await getSession();

  // Vérifier si l'utilisateur est authentifié et a le rôle requis
  if (!session || !hasRequiredRole(session.user.role, ROLES.dev)) {
    redirect("/login?error=unauthorized");
  }

  const applications = await getApplications("dev");

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-7xl w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6">Applications Dev</h1>
        <p className="text-xl mb-8">
          Bienvenue, {session.user.name}! Voici la liste des applications
          disponibles pour les développeurs.
        </p>

        <ApplicationList applications={applications} />
      </div>
    </main>
  );
}
