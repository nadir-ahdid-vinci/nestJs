"use server";

import { cookies } from "next/headers";
import { RewardDto, CreateRewardDto, UpdateRewardDto } from "../types/reward";

export interface PaginatedRewards {
  items: RewardDto[];
  total: number;
  totalPages: number;
}

export async function getRewards(page: number): Promise<PaginatedRewards> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return { items: [], total: 0, totalPages: 0 };
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/rewards?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch rewards");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return { items: [], total: 0, totalPages: 0 };
  }
}

export async function getReward(id: number): Promise<RewardDto | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.API_URL}/rewards/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reward");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching reward:", error);
    return null;
  }
}

export async function createReward(
  data: CreateRewardDto,
  photo?: File
): Promise<RewardDto | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    if (photo) {
      formData.append("photo", photo);
    }

    const response = await fetch(`${process.env.API_URL}/rewards`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to create reward");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating reward:", error);
    return null;
  }
}

export async function updateReward(
  id: string,
  data: UpdateRewardDto,
  photo?: File
): Promise<RewardDto | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    if (photo) {
      formData.append("photo", photo);
    }

    const response = await fetch(`${process.env.API_URL}/rewards/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to update reward");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating reward:", error);
    return null;
  }
}

export async function deleteReward(id: string): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${process.env.API_URL}/rewards/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete reward");
    }

    return true;
  } catch (error) {
    console.error("Error deleting reward:", error);
    return false;
  }
}
