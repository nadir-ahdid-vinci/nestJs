"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateRewardForm } from "./create-reward-form";

export function CreateRewardDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle récompense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle récompense</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour créer une nouvelle
            récompense.
          </DialogDescription>
        </DialogHeader>
        <CreateRewardForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
