import { Application } from "@/lib/applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { UpdateApplicationDialog } from "@/components/update-application-dialog";
import type { User } from "@/lib/users";
import type { Criticality } from "@/lib/criticalities";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ApplicationLogo } from "@/components/application-logo";

interface ApplicationDetailsProps {
  application: Application;
  users?: User[];
  criticalities?: Criticality[];
  isAdmin?: boolean;
}

export function ApplicationDetails({
  application,
  users,
  criticalities,
  isAdmin = false,
}: ApplicationDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <ApplicationLogo logo={application.logo} name={application.name} size="lg" />
            <div>
              <CardTitle className="text-2xl">{application.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Géré par {application.user.name}
              </p>
            </div>
          </div>
          {isAdmin && users && criticalities && (
            <UpdateApplicationDialog
              application={application}
              users={users}
              criticalities={criticalities}
              trigger={
                <Button variant="outline" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations principales */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Nom</p>
            <p className="text-sm">{application.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Statut</p>
            <div className="flex items-center gap-2">
              <Badge variant={application.open ? "default" : "secondary"}>
                {application.open ? "Ouvert" : "Fermé"}
              </Badge>
              <Badge
                variant={
                  application.status === "OPEN" ? "default" : "destructive"
                }
              >
                {application.status}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Criticité
            </p>
            <p className="text-sm capitalize">{application.criticality.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Créé par
            </p>
            <p className="text-sm">{application.user.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Date de création
            </p>
            <p className="text-sm">{formatDate(application.createdAt)}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Description
          </p>
          <p className="text-sm whitespace-pre-wrap">
            {application.description}
          </p>
        </div>

        {/* Périmètre */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Périmètre</p>
          <p className="text-sm whitespace-pre-wrap">{application.scope}</p>
        </div>

        {/* Points par niveau */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Points par niveau
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Low</p>
              <p className="text-sm font-medium">
                {application.criticality.low} points
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Medium</p>
              <p className="text-sm font-medium">
                {application.criticality.medium} points
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">High</p>
              <p className="text-sm font-medium">
                {application.criticality.high} points
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-sm font-medium">
                {application.criticality.critical} points
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Statistiques
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Total des rapports
              </p>
              <p className="text-sm font-medium">
                {application.statistics.total}
              </p>
            </div>
            {application.statistics.byLevel.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Par niveau</p>
                <div className="space-y-1">
                  {application.statistics.byLevel.map((stat) => (
                    <p key={stat.level} className="text-sm">
                      {stat.level}: {stat.count}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
