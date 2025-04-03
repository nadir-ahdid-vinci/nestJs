import { RewardDto, CreateRewardDto, UpdateRewardDto } from "./types/reward";
import {
  getRewards,
  getReward,
  createReward,
  updateReward,
  deleteReward,
  type PaginatedRewards,
} from "./actions/rewards";

export type { RewardDto, CreateRewardDto, UpdateRewardDto, PaginatedRewards };
export { getRewards, getReward, createReward, updateReward, deleteReward };
