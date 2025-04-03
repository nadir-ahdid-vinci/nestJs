import { getSession } from "@/lib/auth";
import { hasRequiredRole, ROLES } from "@/lib/roles";
import { redirect, notFound } from "next/navigation";
import { getApplication, getApplicationLogs } from "@/lib/applications";
import { ApplicationLogs } from "@/components/application-logs";
import { ApplicationDetails } from "@/components/application-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";
import { getUsers } from "@/lib/users";
import { getCriticalities } from "@/lib/criticalities";

interface ApplicationPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: ApplicationPageProps): Promise<Metadata> {
  const application = await getApplication(+params.id);

  if (!application) {
    return {
      title: "Application non trouvée",
    };
  }

  return {
    title: `${application.name} - Détails de l'application`,
    description: application.description,
  };
}

export default async function ApplicationPage({
  params,
}: ApplicationPageProps) {
  const session = await getSession();
  if (!session || !hasRequiredRole(session.user.role, ROLES.hunter)) {
    redirect("/login");
  }

  const isAdmin = hasRequiredRole(session.user.role, ROLES.admin);

  // Ne récupérer les logs et les données supplémentaires que si l'utilisateur est admin
  const [application, logs, users, criticalities] = await Promise.all([
    getApplication(+params.id),
    isAdmin
      ? getApplicationLogs(+params.id)
      : Promise.resolve({ items: [], total: 0, page: 1, totalPages: 1 }),
    isAdmin ? getUsers() : Promise.resolve([]),
    isAdmin ? getCriticalities() : Promise.resolve([]),
  ]);

  if (!application) {
    notFound();
  }

  return (
    <div className="container py-8">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          {isAdmin && <TabsTrigger value="history">Historique</TabsTrigger>}
        </TabsList>
        <TabsContent value="details">
          <ApplicationDetails
            application={application}
            users={users}
            criticalities={criticalities}
            isAdmin={isAdmin}
          />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="history">
            <ApplicationLogs logs={logs.items} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
