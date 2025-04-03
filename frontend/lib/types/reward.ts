export interface RewardDto {
  id: number;
  name: string;
  description: string;
  points: number;
  quantity: number;
  available: boolean;
  photo: string;
  createdAt: string;
}

export interface CreateRewardDto {
  name: string;
  description: string;
  points: number;
  quantity: number;
  available: boolean;
  photo: File;
}

export interface UpdateRewardDto {
  name?: string;
  description?: string;
  points?: number;
  quantity?: number;
  available?: boolean;
  photo?: File;
}
