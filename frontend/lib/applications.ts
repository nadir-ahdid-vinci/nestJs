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

export async function getApplications(): Promise<Application[]> {
  const token = cookies().get("session-token")?.value

  if (!token) {
    return []
  }

  try {
    console.log("Fetching applications")
    const response = await fetch(`${process.env.API_URL}/applications`, {
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

export async function getApplicationsHunter() {
  const token = cookies().get("session-token")?.value
  
  if (!token) {
    return []
  }

  try {
    const response = await fetch(`${process.env.API_URL}/applications/hunter`, {
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

export async function getApplicationsDev(id: number) {
  const token = cookies().get("session-token")?.value
  
  if (!token) {
    return []
  }

  try {
    const response = await fetch(`${process.env.API_URL}/applications/dev/${id}`, {
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



