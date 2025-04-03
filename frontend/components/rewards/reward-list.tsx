import { RewardDto } from "@/lib/types/reward";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { RewardLogo } from "./reward-logo";
import { CreateRewardDialog } from "./create/create-reward-dialog";

interface RewardListProps {
  rewards: RewardDto[];
  total: number;
  pages: number;
  currentPage: number;
}

export function RewardList({
  rewards,
  total,
  pages,
  currentPage,
}: RewardListProps) {
  if (rewards.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <CreateRewardDialog />
        </div>
        <div className="text-center p-8 border rounded-lg bg-muted/50">
          <p>Aucune récompense disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateRewardDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <Card key={reward.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <RewardLogo
                    logo={reward.photo}
                    name={reward.name}
                    size="sm"
                  />
                  <div>
                    <CardTitle>
                      <Link href={`/admin/rewards/${reward.id}`}>
                        {reward.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {reward.description || "Aucune description"}
              </p>
              <p className="text-sm mt-2 font-mono text-muted-foreground">
                {reward.points} points
              </p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Créée le {formatDate(reward.createdAt)}
            </CardFooter>
          </Card>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/admin/rewards?page=${page}`}
              className={`px-4 py-2 rounded ${
                currentPage === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
