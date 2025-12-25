"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setIsAuthenticated(true);
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // You can replace this with a spinner or skeleton
  }
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}