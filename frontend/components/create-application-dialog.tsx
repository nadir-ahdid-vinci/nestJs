"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateApplicationForm } from "@/components/create-application-form";
import { useState } from "react";
import type { User } from "@/lib/users";
import { Plus } from "lucide-react";
import type { Criticality } from "@/lib/criticalities";

interface CreateApplicationDialogProps {
  users: User[];
  criticalities: Criticality[];
}

export function CreateApplicationDialog({
  users,
  criticalities,
}: CreateApplicationDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Créer une application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle application</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour créer une nouvelle
            application.
          </DialogDescription>
        </DialogHeader>
        <CreateApplicationForm
          users={users}
          criticalities={criticalities}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
