import { getApplications } from "@/lib/applications";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasRequiredRole, ROLES } from "@/lib/roles";
import { ApplicationList } from "@/components/application-list";
import { CreateApplicationDialog } from "@/components/create-application-dialog";
import { getUsers } from "@/lib/users";
import { getCriticalities } from "@/lib/criticalities";

export default async function AdminApplicationsPage() {
  const session = await getSession();

  // Vérifier si l'utilisateur est authentifié et a le rôle requis
  if (!session || !hasRequiredRole(session.user.role, ROLES.admin)) {
    redirect("/login?error=unauthorized");
  }

  const [applications, users, criticalities] = await Promise.all([
    getApplications("admin"),
    getUsers(),
    getCriticalities(),
  ]);

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Applications Admin</h1>
          <CreateApplicationDialog
            users={users}
            criticalities={criticalities}
          />
        </div>

        <p className="text-xl mb-8">
          Bienvenue, {session.user.name}! Voici la liste des applications
          disponibles pour les administrateurs.
        </p>

        <ApplicationList
          applications={applications}
          users={users}
          criticalities={criticalities}
          isAdmin={true}
        />
      </div>
    </main>
  );
}
