"use server";

import { cookies } from "next/headers";

export interface Criticality {
  id: number;
  name: string;
  low: number;
  high: number;
  medium: number;
  critical: number;
}

export interface CreateCriticality {
  name: string;
  low: number;
  high: number;
  medium: number;
  critical: number;
}

export interface UpdateCriticality {
  name?: string;
  low?: number;
  high?: number;
  medium?: number;
  critical?: number;
}

export async function getCriticalities(): Promise<Criticality[]> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/applications/criticality`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching criticalities: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch criticalities:", error);
    return [];
  }
}

export async function getCriticality(id: number): Promise<Criticality | null> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/applications/criticality/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching criticality: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch criticality:", error);
    return null;
  }
}

export async function createCriticality(
  criticality: CreateCriticality
): Promise<Criticality> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/applications/criticality`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(criticality),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Error creating criticality: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to create criticality:", error);
    throw error;
  }
}

export async function updateCriticality(
  id: number,
  criticality: UpdateCriticality
): Promise<Criticality> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/applications/criticality/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(criticality),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating criticality: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update criticality:", error);
    throw error;
  }
}
