"use server"

import { cookies } from "next/headers"

export interface User {
    id: number
    username: string
    email: string
    role: string
}

export async function getUsers(): Promise<User[]> {
    const token = cookies().get("session-token")?.value

    if (!token) {
        return []
    }

    try {
        const response = await fetch(`${process.env.API_URL}/users`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        })

        if (!response.ok) {
        throw new Error(`Error fetching users: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return []
    }
}

