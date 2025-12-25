"use client"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { set } from "zod";

interface AdminLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export function AdminLayout({ children, sidebar  }: AdminLayoutProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        if (status === "loading") return;

        if (!session || session.user?.role !== "ADMIN") { //Redirect to login if not admin
            router.push("/login");
        }
        else {
            setIsAuth(true);
        }
    }, [session, status, router]);

    if (!isAuth) {
        return null
    }

    if (status === "loading") {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
        <div className="flex min-h-screen">
            <aside>{sidebar}</aside>
            <main>
                {children}
            </main>
        </div>
    );
}
