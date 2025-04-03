import type { ApplicationLog } from "@/lib/applications";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";

interface ApplicationLogsProps {
  logs: ApplicationLog[];
  title?: string;
}

const EXCLUDED_FIELDS = [
  "id",
  "createdAt",
  "user",
  "hallOfFame",
  "statistics",
  "criticality",
  "logo",
];

function formatValue(value: any): string {
  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function getFieldLabel(key: string): string {
  const labels: Record<string, string> = {
    name: "Nom",
    description: "Description",
    scope: "Périmètre",
    status: "Statut",
    open: "Ouvert",
  };
  return labels[key] || key;
}

function formatChanges(previousValues: any, newValues: any) {
  if (!previousValues && newValues) {
    // Cas de création
    const relevantFields = Object.entries(newValues).filter(
      ([key]) => !EXCLUDED_FIELDS.includes(key)
    );

    if (relevantFields.length === 0) return null;

    return (
      <div className="space-y-1">
        <p className="text-sm font-medium">Création avec les valeurs :</p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {relevantFields.map(([key, value]) => (
            <li key={key} className="text-green-600">
              {getFieldLabel(key)}: {formatValue(value)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (previousValues && newValues) {
    // Cas de modification
    const changes = Object.entries(newValues).filter(
      ([key]) =>
        !EXCLUDED_FIELDS.includes(key) &&
        JSON.stringify(previousValues[key]) !== JSON.stringify(newValues[key])
    );

    if (changes.length === 0) return null;

    return (
      <div className="space-y-2">
        {changes.map(([key, newValue]) => {
          const oldValue = previousValues[key];
          return (
            <div key={key} className="text-sm space-y-1">
              <span className="font-medium">{getFieldLabel(key)} :</span>
              <div className="ml-4 space-y-0.5">
                <p className="text-red-500/80">
                  Avant : {formatValue(oldValue)}
                </p>
                <p className="text-green-600">
                  Après : {formatValue(newValue)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    created: "Création",
    updated: "Modification",
    deleted: "Suppression",
  };
  return labels[action] || action;
}

export function ApplicationLogs({
  logs,
  title = "Historique des modifications",
}: ApplicationLogsProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <p>Aucun historique disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col space-y-2 border-l-2 border-muted pl-4 relative"
              >
                <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-2" />
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {getActionLabel(log.action)}
                  </p>
                </div>
                {formatChanges(log.previousValues, log.newValues)}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Par {log.user.name}</span>
                  <span>•</span>
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
