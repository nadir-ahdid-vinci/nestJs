"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createReward } from "@/lib/rewards";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { CreateRewardDto } from "@/lib/types/reward";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  points: z.coerce.number().min(0, "Les points doivent être positifs"),
  quantity: z.coerce.number().min(0, "La quantité doit être positive"),
  available: z.boolean().default(true),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateRewardFormProps {
  onSuccess?: () => void;
}

export function CreateRewardForm({ onSuccess }: CreateRewardFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      points: 0,
      quantity: 0,
      available: true,
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("points", data.points.toString());
      formData.append("quantity", data.quantity.toString());
      formData.append("available", data.available.toString());

      if (data.photo) {
        formData.append("photo", data.photo);
      }

      const reward = await createReward(data as CreateRewardDto, data.photo);

      if (reward) {
        toast.success("Récompense créée avec succès");
        router.refresh();
        onSuccess?.();
      } else {
        toast.error("Erreur lors de la création de la récompense");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="photo"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Photo</FormLabel>
              <FormControl>
                <ImageUpload value={value} onChange={onChange} {...field} />
              </FormControl>
              <FormDescription>
                Ajoutez une photo pour la récompense
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom de la récompense" {...field} />
              </FormControl>
              <FormDescription>
                Le nom de la récompense doit être unique
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description de la récompense"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Décrivez la récompense en détail
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points requis</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Points requis"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Nombre de points nécessaires pour obtenir cette récompense
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité disponible</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Quantité disponible"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Nombre d'unités disponibles</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Disponible</FormLabel>
                <FormDescription>
                  Rendre la récompense disponible ou non
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Création en cours..." : "Créer la récompense"}
        </Button>
      </form>
    </Form>
  );
}
