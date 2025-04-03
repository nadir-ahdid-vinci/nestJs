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
import { updateApplicationAction } from "@/app/actions";
import type { User } from "@/lib/users";
import type { Criticality } from "@/lib/criticalities";
import type { Application } from "@/lib/applications";
import { Switch } from "@/components/ui/switch";

interface UpdateApplicationFormProps {
  application: Application;
  users: User[];
  criticalities: Criticality[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UpdateApplicationForm({
  application,
  users,
  criticalities,
  onSuccess,
  onCancel,
}: UpdateApplicationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(application.status === "OPEN");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData();

    // Only add fields that have been modified
    const name = form.querySelector<HTMLInputElement>('[name="name"]')?.value;
    if (name && name !== application.name) {
      formData.append("name", name);
    }

    const description = form.querySelector<HTMLTextAreaElement>(
      '[name="description"]'
    )?.value;
    if (description && description !== application.description) {
      formData.append("description", description);
    }

    const scope =
      form.querySelector<HTMLTextAreaElement>('[name="scope"]')?.value;
    if (scope && scope !== application.scope) {
      formData.append("scope", scope);
    }

    const logo =
      form.querySelector<HTMLInputElement>('[name="logo"]')?.files?.[0];
    if (logo) {
      formData.append("logo", logo);
    }

    const criticalityId = form.querySelector<HTMLInputElement>(
      '[name="criticalityId"]'
    )?.value;
    if (
      criticalityId &&
      criticalityId !== application.criticality.id.toString()
    ) {
      formData.append("criticalityId", criticalityId);
    }

    const userId =
      form.querySelector<HTMLInputElement>('[name="userId"]')?.value;
    if (userId && userId !== application.user.id.toString()) {
      formData.append("userId", userId);
    }

    // Always send the open status as it's a boolean switch
    formData.append("open", isOpen.toString());

    startTransition(async () => {
      const result = await updateApplicationAction(application.id, formData);

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
        <Label htmlFor="name">Nom de l'application</Label>
        <Input
          id="name"
          name="name"
          minLength={3}
          maxLength={100}
          defaultValue={application.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          minLength={10}
          maxLength={1000}
          defaultValue={application.description}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scope">Périmètre</Label>
        <Textarea
          id="scope"
          name="scope"
          minLength={5}
          maxLength={500}
          defaultValue={application.scope}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo de l'application</Label>
        <Input id="logo" name="logo" type="file" accept="image/*" />
        <p className="text-sm text-muted-foreground">
          Laissez vide pour conserver le logo actuel
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="criticality">Criticité</Label>
        <Select
          name="criticalityId"
          defaultValue={application.criticality.id.toString()}
        >
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
        <Label htmlFor="owner">Propriétaire</Label>
        <Select name="userId" defaultValue={application.user.id.toString()}>
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

      <div className="flex items-center space-x-2">
        <Switch id="open" checked={isOpen} onCheckedChange={setIsOpen} />
        <Label htmlFor="open">Application ouverte</Label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Modification en cours..." : "Modifier"}
        </Button>
      </div>
    </form>
  );
}
