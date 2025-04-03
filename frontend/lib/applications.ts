import { cookies } from "next/headers";
import { Criticality } from "./criticalities";

export interface ApplicationOwner {
  id: number;
  name: string;
}

export interface ApplicationStatistics {
  total: number;
  byLevel: Array<{
    level: string;
    count: number;
  }>;
}

export interface Application {
  id: number;
  name: string;
  description: string;
  scope: string;
  logo: string;
  createdAt: string;
  status: "OPEN" | "CLOSED";
  user: {
    id: number;
    name: string;
    email: string;
  };
  criticality: Criticality;
  statistics: {
    total: number;
    byLevel: Array<{
      level: string;
      count: number;
    }>;
  };
}

export interface CreateApplicationData {
  name: string;
  description: string;
  scope: string;
  criticalityId: number;
  userId: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApplicationLog {
  id: number;
  action: string;
  previousValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface ApplicationLogsResponse {
  items: ApplicationLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UpdateApplicationData {
  name?: string;
  description?: string;
  scope?: string;
  logo?: File;
  criticalityId?: number;
  userId?: number;
  open?: boolean;
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export async function getApplications(page: string): Promise<Application[]> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/applications?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching applications: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return [];
  }
}

export async function getApplication(id: number): Promise<Application | null> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.API_URL}/applications/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching application: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch application:", error);
    return null;
  }
}

export async function createApplication(
  data: CreateApplicationData & { logo: File }
): Promise<Application | null> {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("scope", data.scope);
    formData.append("criticalityId", data.criticalityId.toString());
    formData.append("userId", data.userId.toString());
    formData.append("logo", data.logo);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/applications`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            document.cookie.split("session-token=")[1]?.split(";")[0]
          }`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Error creating application: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to create application:", error);
    throw error;
  }
}

export async function updateApplication(
  id: number,
  data: FormData
): Promise<Application> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getCookie("session-token")}`,
      },
      body: data,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Une erreur est survenue lors de la modification"
    );
  }

  return response.json();
}

export async function updateApplicationStatus(
  id: number,
  status: string
): Promise<Application | null> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/applications/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating application status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update application status:", error);
    return null;
  }
}

export async function getApplicationLogs(
  id: number
): Promise<ApplicationLogsResponse> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    return {
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    };
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/applications/${id}/logs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching application logs: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch application logs:", error);
    return {
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    };
  }
}
