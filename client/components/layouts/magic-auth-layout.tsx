
"use client";

import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/magicui/dot-pattern";

interface MagicAuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function MagicAuthLayout({ children, title, description }: MagicAuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
        
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]",
          "opacity-50"
        )}
      />

      <div className="z-10 w-full max-w-sm md:max-w-md">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
            </h1>
            <p className="mt-2 text-muted-foreground">
                {description}
            </p>
        </div>
        
        <div className="relative rounded-2xl border bg-card/50 px-4 py-8 shadow-xl backdrop-blur-sm sm:px-8">
            {children}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} JurisQBank. All rights reserved.
        </div>
      </div>
    </div>
  );
}
