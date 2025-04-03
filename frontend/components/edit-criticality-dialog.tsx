"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCriticalityAction } from "@/app/actions";
import { toast } from "@/components/ui/use-toast";

interface Criticality {
  id: number;
  name: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

interface EditCriticalityDialogProps {
  criticality: Criticality;
}

export function EditCriticalityDialog({
  criticality,
}: EditCriticalityDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await updateCriticalityAction(criticality.id, formData);

      if (result.success) {
        toast({
          title: "Succès",
          description: "La criticité a été mise à jour avec succès",
        });
        setOpen(false);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Modifier</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la criticité</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              defaultValue={criticality.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="low">Low</Label>
            <Input
              id="low"
              name="low"
              type="number"
              min="0"
              defaultValue={criticality.low}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medium">Medium</Label>
            <Input
              id="medium"
              name="medium"
              type="number"
              min="0"
              defaultValue={criticality.medium}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="high">High</Label>
            <Input
              id="high"
              name="high"
              type="number"
              min="0"
              defaultValue={criticality.high}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="critical">Critical</Label>
            <Input
              id="critical"
              name="critical"
              type="number"
              min="0"
              defaultValue={criticality.critical}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
