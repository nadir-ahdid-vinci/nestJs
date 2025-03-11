import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeScript } from "./theme-script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HunterApp - Authentication",
  description: "Une application avec authentification et contrôle d'accès basé sur les rôles",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
            <div className="relative min-h-screen flex flex-col w-full">
            <Header />
            <div className="flex-1 bg-background text-foreground mx-auto w-full">{children}</div>
            </div>
        </ThemeProvider>
      </body>
    </html>
  )
}