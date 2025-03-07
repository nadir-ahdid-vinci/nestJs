"use server"

import { cookies } from "next/headers"

export interface ApplicationOwner {
  id: number
  username: string
}

export interface Application {
  id: number
  name: string
  description: string
  owner: ApplicationOwner
  status: string
  createdAt: string
}

export async function getApplications(page: string): Promise<Application[]> {
  const token = cookies().get("session-token")?.value

  if (!token) {
    return []
  }

  const queryParams = new URLSearchParams();

  if (page) {
    queryParams.append('page', page);
  }

  try {
    const response = await fetch(`${process.env.API_URL}/applications?${queryParams.toString()}`, {
      headers: {
      Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error fetching applications: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch applications:", error)
    return []
  }
}

export async function getApplication(id: number): Promise<Application | null> {
  const token = cookies().get("session-token")?.value

  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${process.env.API_URL}/applications/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error fetching application: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch application:", error)
    return null
  }
}

export interface CreateApplicationData {
  name: string
  description: string
  status: string
  ownerId: number
}

export async function createApplication(data: CreateApplicationData): Promise<Application | null> {
  const token = cookies().get("session-token")?.value

  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${process.env.API_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Error creating application: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to create application:", error)
    return null
  }
}



