"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
}

export default function AdminLayout({ children, sidebar } : AdminLayoutProps) {
    const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (status === "unauthenticated" || !(session && session.user?.role == "ADMIN")) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex">
        <aside>
            {sidebar}
        </aside>
        <main>
            {children}
        </main>
    </div>
  );
}