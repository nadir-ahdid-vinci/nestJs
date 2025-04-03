import { getSession } from "@/lib/auth";
import { hasRequiredRole, ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import { RewardList } from "@/components/rewards/reward-list";
import { getRewards } from "@/lib/rewards";

interface PageProps {
  searchParams: {
    page?: string;
  };
}

export default async function RewardsPage({ searchParams }: PageProps) {
  const session = await getSession();

  if (!session || !hasRequiredRole(session.user?.role, ROLES.hunter)) {
    redirect("/login?error=unauthorized");
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const rewards = await getRewards(page);

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Récompenses</h1>
        </div>

        <p className="text-xl mb-8">
          Bienvenue, {session.user.name}! Voici la liste des récompenses
          disponibles.
        </p>
        <RewardList
          rewards={rewards.items}
          total={rewards.total}
          pages={rewards.pages}
          currentPage={page}
        />
      </div>
    </main>
  );
}
