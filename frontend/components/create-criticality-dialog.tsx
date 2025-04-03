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
import { createCriticalityAction } from "@/app/actions";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle } from "lucide-react";

export function CreateCriticalityDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const low = parseInt(formData.get("low") as string);
    const medium = parseInt(formData.get("medium") as string);
    const high = parseInt(formData.get("high") as string);
    const critical = parseInt(formData.get("critical") as string);

    // Validation côté client
    if (!name || name.length < 3 || name.length > 50) {
      toast({
        title: "Erreur",
        description: "Le nom doit contenir entre 3 et 50 caractères",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (isNaN(low) || isNaN(medium) || isNaN(high) || isNaN(critical)) {
      toast({
        title: "Erreur",
        description: "Toutes les valeurs doivent être des nombres valides",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

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
      toast({
        title: "Erreur",
        description: "Les valeurs dépassent les limites autorisées",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (low >= medium || medium >= high || high >= critical) {
      toast({
        title: "Erreur",
        description:
          "Les valeurs doivent être strictement croissantes (low < medium < high < critical)",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await createCriticalityAction(formData);

      if (result.success) {
        toast({
          title: "Succès",
          description: "La criticité a été créée avec succès",
        });
        setOpen(false);
        // Reset form
        (event.target as HTMLFormElement).reset();
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
        description: "Une erreur est survenue lors de la création",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Créer une criticité
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une nouvelle criticité</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nom de la criticité"
              minLength={3}
              maxLength={50}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="low">Low (1-40)</Label>
            <Input
              id="low"
              name="low"
              type="number"
              min="1"
              max="40"
              placeholder="Valeur Low"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medium">Medium (1-60)</Label>
            <Input
              id="medium"
              name="medium"
              type="number"
              min="1"
              max="60"
              placeholder="Valeur Medium"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="high">High (1-80)</Label>
            <Input
              id="high"
              name="high"
              type="number"
              min="1"
              max="80"
              placeholder="Valeur High"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="critical">Critical (1-100)</Label>
            <Input
              id="critical"
              name="critical"
              type="number"
              min="1"
              max="100"
              placeholder="Valeur Critical"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création en cours..." : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
