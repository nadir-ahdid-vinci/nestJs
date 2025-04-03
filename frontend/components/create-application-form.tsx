"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createApplicationAction } from "@/app/actions";
import type { User } from "@/lib/users";
import type { Criticality } from "@/lib/criticalities";

interface CreateApplicationFormProps {
  users: User[];
  criticalities: Criticality[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateApplicationForm({
  users,
  criticalities,
  onSuccess,
  onCancel,
}: CreateApplicationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createApplicationAction(formData);

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'application *</Label>
        <Input id="name" name="name" required minLength={3} maxLength={100} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={1000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scope">Périmètre *</Label>
        <Textarea
          id="scope"
          name="scope"
          required
          minLength={5}
          maxLength={500}
          placeholder="Décrivez le périmètre de test de l'application"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo de l'application *</Label>
        <Input id="logo" name="logo" type="file" accept="image/*" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="criticality">Criticité *</Label>
        <Select name="criticalityId" required>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une criticité" />
          </SelectTrigger>
          <SelectContent>
            {criticalities.map((criticality) => (
              <SelectItem
                key={criticality.id}
                value={criticality.id.toString()}
              >
                {criticality.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner">Propriétaire *</Label>
        <Select name="userId" required>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un utilisateur" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création en cours..." : "Créer"}
        </Button>
      </div>
    </form>
  );
}
