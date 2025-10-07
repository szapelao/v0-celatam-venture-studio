"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/celobuddy-logo.png"
            alt="CeloBuddy"
            width={180}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <div className="relative">
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>

          {isMenuOpen && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />

              {/* Menu content */}
              <div className="absolute right-0 top-12 z-50 w-56 rounded-md border border-border bg-background shadow-lg">
                <div className="p-1">
                  <a
                    href="https://docs.celo.org/home/celo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center rounded-sm px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Build with Celo
                  </a>
                  <a
                    href="https://x.com/celo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center rounded-sm px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Stay Updated
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
