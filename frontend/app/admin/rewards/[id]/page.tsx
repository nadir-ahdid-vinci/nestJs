import { RewardDetails } from "@/components/rewards/reward-details";
import { getReward } from "@/lib/rewards";

export default async function RewardPage({ params }: { params: { id: string } }) {
    const reward = await getReward(+params.id);
    if (!reward) {
        return <div>Reward not found</div>;
    }
    return (
        <RewardDetails reward={reward} />
    );
}
