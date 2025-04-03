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
import { UpdateApplicationForm } from "@/components/update-application-form";
import { useState } from "react";
import type { User } from "@/lib/users";
import type { Criticality } from "@/lib/criticalities";
import type { Application } from "@/lib/applications";
import { Pencil } from "lucide-react";

interface UpdateApplicationDialogProps {
  application: Application;
  users: User[];
  criticalities: Criticality[];
  trigger?: React.ReactNode;
}

export function UpdateApplicationDialog({
  application,
  users,
  criticalities,
  trigger,
}: UpdateApplicationDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Modifier l'application</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'application ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <UpdateApplicationForm
          application={application}
          users={users}
          criticalities={criticalities}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
