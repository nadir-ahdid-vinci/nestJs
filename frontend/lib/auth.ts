"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Types for authentication
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Session = {
  user: User;
};

// Function to login user
export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Login failed" };
    }

    // Store the session token in a secure HTTP-only cookie
    cookies().set({
      name: "session-token",
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 heures (en secondes)
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

// Function to logout user
export async function logout() {
  cookies().delete("session-token");
  redirect("/login");
}

// Function to get the current session
export async function getSession(): Promise<Session | null> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    return null;
  }

  try {
    // Use the /auth/me endpoint to get user data
    const response = await fetch(`${process.env.API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();

    return {
      user: {
        id: userData.id,
        name: userData.username,
        email: userData.email,
        role: userData.role,
      },
    };
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}
