"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditCriticalityDialog } from "@/components/edit-criticality-dialog";

interface Criticality {
  id: number;
  name: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

interface CriticalityListProps {
  criticalities: Criticality[];
}

export function CriticalityList({ criticalities }: CriticalityListProps) {
  return (
    <div className="grid gap-4">
      {criticalities.map((criticality) => (
        <Card key={criticality.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">{criticality.name}</CardTitle>
              <EditCriticalityDialog criticality={criticality} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-8">
              <div>
                <span className="font-semibold">Low: </span>
                <span>{criticality.low}</span>
              </div>
              <div>
                <span className="font-semibold">Medium: </span>
                <span>{criticality.medium}</span>
              </div>
              <div>
                <span className="font-semibold">High: </span>
                <span>{criticality.high}</span>
              </div>
              <div>
                <span className="font-semibold">Critical: </span>
                <span>{criticality.critical}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
