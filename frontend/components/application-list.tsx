import type { Application } from "@/lib/applications";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { UpdateApplicationDialog } from "@/components/update-application-dialog";
import type { User } from "@/lib/users";
import type { Criticality } from "@/lib/criticalities";
import { ApplicationLogo } from "@/components/application-logo";

interface ApplicationListProps {
  applications: Application[];
  users?: User[];
  criticalities?: Criticality[];
  isAdmin?: boolean;
}

export function ApplicationList({
  applications,
  users,
  criticalities,
  isAdmin = false,
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <p>Aucune application disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map((app) => (
        <Card key={app.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <ApplicationLogo logo={app.logo} name={app.name} size="sm" />
                <div>
                  <CardTitle>
                    <Link href={`/application/${app.id}`}>{app.name}</Link>
                  </CardTitle>
                  <CardDescription>Par {app.user.name}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={app.status} />
                {isAdmin && users && criticalities && (
                  <UpdateApplicationDialog
                    application={app}
                    users={users}
                    criticalities={criticalities}
                  />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{app.description || "Aucune description"}</p>
            <p className="text-sm mt-2 font-mono text-muted-foreground">
              {app.scope}
            </p>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Créée le {formatDate(app.createdAt)}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";

  switch (status) {
    case "OPEN":
      variant = "default";
      break;
    case "CLOSED":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }

  return (
    <Badge variant={variant}>{status === "OPEN" ? "Ouverte" : "Fermée"}</Badge>
  );
}
