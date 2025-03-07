"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface NavMenuProps {
    title: string
    items: {
        title: string
        href: string
    }[]
    className?: string
}

export function NavMenu({ title, items, className }: NavMenuProps) {
    const pathname = usePathname()

    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn("flex items-center gap-1", className)}>
            {title}
            <ChevronDown className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
            {items.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
                <Link
                href={item.href}
                className={cn("w-full", pathname === item.href && "font-medium bg-accent text-accent-foreground")}
                >
                {item.title}
                </Link>
            </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
        </DropdownMenu>
    )
}

