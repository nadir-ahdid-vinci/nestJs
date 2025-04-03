import { getSession } from "@/lib/auth";
import { hasRequiredRole, ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getCriticalities } from "@/lib/criticalities";
import { CreateCriticalityDialog } from "@/components/create-criticality-dialog";
import { CriticalityList } from "@/components/criticality-list";

export default async function CriticalitiesPage() {
  const session = await getSession();

  if (!session || !hasRequiredRole(session.user.role, ROLES.admin)) {
    redirect("/login?error=unauthorized");
  }

  const criticalities = await getCriticalities();

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Criticités</h1>
          <CreateCriticalityDialog />
        </div>

        <p className="text-xl mb-8">
          Bienvenue, {session.user.name}! Voici la liste des niveaux de
          criticité.
        </p>

        <CriticalityList criticalities={criticalities} />
      </div>
    </main>
  );
}
