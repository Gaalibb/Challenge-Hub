import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">EduLink360</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/smart-connect" className="inline-flex">
              <Button size="sm" variant="outline" className="gap-2 font-medium">
                <Users className="h-4 w-4" />
                SmartConnect
              </Button>
            </Link>
            <Link href="/new" className="inline-flex">
              <Button size="sm" className="gap-2 font-medium">
                <PlusCircle className="h-4 w-4" />
                Post Challenge
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-8 mt-12 bg-muted/40">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>EduLink360 &copy; {new Date().getFullYear()} — Intellectual challenge, precise and purposeful.</p>
        </div>
      </footer>
    </div>
  );
}
