import { RewardDto } from "@/lib/types/reward";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { RewardLogo } from "./reward-logo";
import { formatDate } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";

export function RewardDetails({ reward }: { reward: RewardDto }) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image et informations principales */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <RewardLogo logo={reward.photo} name={reward.name} size="lg" />
                <div>
                  <CardTitle className="text-2xl">{reward.name}</CardTitle>
                  <CardDescription>
                    Créée le {formatDate(reward.createdAt)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{reward.description}</p>
            </CardContent>
          </Card>

          {/* Informations détaillées */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Points requis</span>
                <Badge variant="secondary" className="text-lg">
                  {reward.points} points
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stock disponible</span>
                <Badge
                  variant={reward.quantity > 0 ? "default" : "destructive"}
                >
                  {reward.quantity} unités
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant={reward.available ? "default" : "secondary"}>
                  {reward.available ? "Disponible" : "Indisponible"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!reward.available || reward.quantity === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Commander
                </Button>
                {(!reward.available || reward.quantity === 0) && (
                  <p className="text-sm text-muted-foreground text-center">
                    {!reward.available
                      ? "Cette récompense n'est plus disponible"
                      : "Cette récompense est en rupture de stock"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
