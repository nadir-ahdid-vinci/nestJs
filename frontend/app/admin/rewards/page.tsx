import { getSession } from '@/lib/auth'
import { hasRequiredRole, ROLES } from '@/lib/roles';
import { redirect } from 'next/navigation';
import { getRewards } from '@/lib/rewards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function RewardsPage() {
    const session = await getSession()

    if (!session || !hasRequiredRole(session.user?.role, ROLES.HUNTER)) {
        redirect("/login?error=unauthorized")
    }

    const rewards = await getRewards()

    return (
        <main className="flex min-h-screen flex-col p-8">
            <div className="max-w-7xl w-full mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Récompenses</h1>
                </div>

                <p className="text-xl mb-8">
                    Bienvenue, {session.user.name}! Voici la liste des récompenses disponibles.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewards.map((reward) => (
                        <Card key={reward.id} className="overflow-hidden">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>
                                            <Link href={`/reward/${reward.id}`}>{reward.name}</Link>
                                        </CardTitle>
                                        <CardDescription>{reward.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{reward.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    );
}
