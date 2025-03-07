import type { Application } from "@/lib/applications"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ApplicationListProps {
    applications: Application[]
}

export function ApplicationList({ applications }: ApplicationListProps) {
    if (applications.length === 0) {
        return (
        <div className="text-center p-8 border rounded-lg bg-muted/50">
            <p>Aucune application disponible pour le moment.</p>
        </div>
        )
    }

    console.log(applications, "applications")

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
            <Card key={app.id} className="overflow-hidden">
            <CardHeader>
                <div className="flex justify-between items-start">
                <div>
                    <CardTitle>{app.name}</CardTitle>
                    <CardDescription>Par {app.owner.username}</CardDescription>
                </div>
                <StatusBadge status={app.status} />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm">{app.description}</p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">Créée le {formatDate(app.createdAt)}</CardFooter>
            </Card>
        ))}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"

    switch (status) {
        case "OPEN":
        variant = "default"
        break
        case "CLOSED":
        variant = "destructive"
        break
        case "PENDING":
        variant = "secondary"
        break
        default:
        variant = "outline"
    }

    return <Badge variant={variant}>{status}</Badge>
}

