"use server"

import { cookies } from "next/headers"

export interface Reward {
    id: number
    name: string
    description: string
    price: number
    imageUrl: string
    quantity: number
    locked: boolean
}

export async function getRewards(): Promise<Reward[]> {
    const token = cookies().get("session-token")?.value

    if (!token) {
        return []
    }

    try {
        const response = await fetch(`${process.env.API_URL}/rewards`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache",
            },
        })

        if (!response.ok) {
            throw new Error(`Error fetching rewards: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Failed to fetch rewards:", error)
        return []
    }
}

export async function getReward(id: number): Promise<Reward | null> {
    const token = cookies().get("session-token")?.value

    if (!token) {
        return null
    }

    try {
        const response = await fetch(`${process.env.API_URL}/rewards/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache",
            },
        })

        if (!response.ok) {
            throw new Error(`Error fetching reward: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Failed to fetch reward:", error)
        return null
    }
}

export async function createReward(reward: Reward): Promise<Reward | null> {
    const token = cookies().get("session-token")?.value

    if (!token) {
        return null
    }

    try {
        const response = await fetch(`${process.env.API_URL}/rewards`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reward),
        })

        if (!response.ok) {
            throw new Error(`Error creating reward: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Failed to create reward:", error)
        return null
    }
}

export async function updateReward(reward: Reward): Promise<Reward | null> {
    const token = cookies().get("session-token")?.value

    if (!token) {
        return null
    }

    try {
        const response = await fetch(`${process.env.API_URL}/rewards/${reward.id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reward),
        })

        if (!response.ok) {
            throw new Error(`Error updating reward: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Failed to update reward:", error)
        return null
    }
}