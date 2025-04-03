"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { hasRequiredRole, ROLES } from "@/lib/roles";
import { updateCriticality, createCriticality } from "@/lib/criticalities";

interface CreateApplicationFormData {
  name: string;
  description: string;
  scope: string;
  criticalityId: string;
  userId: string;
}

export async function createApplicationAction(formData: FormData) {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    throw new Error("Non authentifié");
  }

  const data: CreateApplicationFormData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    scope: formData.get("scope") as string,
    criticalityId: formData.get("criticalityId") as string,
    userId: formData.get("userId") as string,
  };

  const logo = formData.get("logo") as File;
  if (!logo) {
    throw new Error("Le logo est requis");
  }

  try {
    const response = await fetch(`${process.env.API_URL}/applications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la création de l'application"
      );
    }

    revalidatePath("/admin/applications");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.message ||
        "Une erreur est survenue lors de la création de l'application",
    };
  }
}

export interface UpdateApplicationFormData {
  name: string;
  description: string;
  scope: string;
  criticalityId: string;
  userId: string;
  logo?: File;
  open?: boolean;
}

export async function updateApplicationAction(
  id: number,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    return { success: false, error: "Non authentifié" };
  }

  try {
    const response = await fetch(`${process.env.API_URL}/applications/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Une erreur est survenue",
      };
    }

    revalidatePath("/admin/applications");
    revalidatePath("/dev/applications");
    revalidatePath("/hunter/applications");
    revalidatePath(`/application/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating application:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

export async function updateCriticalityAction(
  id: number,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const name = formData.get("name") as string;
    const low = parseInt(formData.get("low") as string);
    const medium = parseInt(formData.get("medium") as string);
    const high = parseInt(formData.get("high") as string);
    const critical = parseInt(formData.get("critical") as string);

    // Validation des valeurs
    if (isNaN(low) || isNaN(medium) || isNaN(high) || isNaN(critical)) {
      return {
        success: false,
        error: "Les valeurs doivent être des nombres valides",
      };
    }

    // Validation des limites
    if (
      low < 0 ||
      low > 40 ||
      medium < 0 ||
      medium > 60 ||
      high < 0 ||
      high > 80 ||
      critical < 0 ||
      critical > 100
    ) {
      return {
        success: false,
        error: "Les valeurs dépassent les limites autorisées",
      };
    }

    // Validation de l'ordre croissant
    if (low >= medium || medium >= high || high >= critical) {
      return {
        success: false,
        error:
          "Les valeurs doivent être strictement croissantes (low < medium < high < critical)",
      };
    }

    const data = {
      name,
      low,
      medium,
      high,
      critical,
    };

    await updateCriticality(id, data);
    revalidatePath("/admin/criticalities");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating criticality:", error);
    return {
      success: false,
      error: error.message || "Une erreur est survenue",
    };
  }
}

export async function createCriticalityAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || !hasRequiredRole(session.user.role, ROLES.admin)) {
      throw new Error("Vous n'avez pas les droits pour créer une criticité");
    }

    const data = {
      name: formData.get("name") as string,
      low: parseInt(formData.get("low") as string),
      medium: parseInt(formData.get("medium") as string),
      high: parseInt(formData.get("high") as string),
      critical: parseInt(formData.get("critical") as string),
    };

    // Vérification que les valeurs sont bien des nombres
    if (
      isNaN(data.low) ||
      isNaN(data.medium) ||
      isNaN(data.high) ||
      isNaN(data.critical)
    ) {
      throw new Error("Les valeurs doivent être des nombres valides");
    }

    // Vérification de l'ordre croissant
    if (
      data.low >= data.medium ||
      data.medium >= data.high ||
      data.high >= data.critical
    ) {
      throw new Error(
        "Les valeurs doivent être strictement croissantes (low < medium < high < critical)"
      );
    }

    // Vérification des limites
    if (
      data.low > 40 ||
      data.medium > 60 ||
      data.high > 80 ||
      data.critical > 100
    ) {
      throw new Error("Les valeurs dépassent les limites autorisées");
    }

    // Vérification du nom
    if (!data.name || data.name.length < 3 || data.name.length > 50) {
      throw new Error("Le nom doit contenir entre 3 et 50 caractères");
    }

    await createCriticality(data);
    revalidatePath("/admin/criticalities");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating criticality:", error);
    return {
      success: false,
      error: error.message || "Une erreur est survenue",
    };
  }
}
