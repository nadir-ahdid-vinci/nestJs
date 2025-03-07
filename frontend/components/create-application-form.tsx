"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createApplication } from "@/lib/applications"
import type { User } from "@/lib/users"

interface CreateApplicationFormProps {
  users: User[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateApplicationForm({ users, onSuccess, onCancel }: CreateApplicationFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isOpen, setIsOpen] = useState(true)
    const [ownerId, setOwnerId] = useState<number | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!name || !description || !ownerId) {
        setError("Veuillez remplir tous les champs obligatoires")
        return
        }

        setIsLoading(true)
        setError("")

        try {
        const result = await createApplication({
            name,
            description,
            status: isOpen ? "OPEN" : "CLOSED",
            ownerId,
        })

        if (result) {
            if (onSuccess) {
            onSuccess()
            }
            router.refresh()
        } else {
            setError("Une erreur est survenue lors de la création de l'application")
        }
        } catch (err) {
        setError("Une erreur inattendue s'est produite")
        } finally {
        setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="name">Nom de l'application *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="flex items-center space-x-2">
            <Checkbox id="status" checked={isOpen} onCheckedChange={(checked) => setIsOpen(checked as boolean)} />
            <Label htmlFor="status" className="cursor-pointer">
                Application ouverte
            </Label>
            </div>

            <div className="space-y-2">
            <Label htmlFor="owner">Propriétaire *</Label>
            <Select onValueChange={(value) => setOwnerId(Number(value))} required>
                <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                    {user.username} ({user.email})
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer"}
            </Button>
        </div>
        </form>
    )
}

