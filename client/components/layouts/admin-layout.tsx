"use client"
import { desc } from "motion/react-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export function AdminLayout({ children, sidebar  }: AdminLayoutProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (status === "loading") return;

        if (!session || session.user?.role !== "ADMIN") {
            router.push("/login"); //Redirect to login if not admin
            return;
        }

        setIsAuthorized(true);
    }, [session, status, router]);

    if (!isAuthorized) {
        const description = session ? "You do not have access to this page." : "Please log in to access the admin dashboard.";
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <div className="shadow-2xl rounded-2xl border-black p-6 text-center w-fit h-fit">
                    <h1 className="text-3xl text-red-600">404 NOT FOUND!</h1>
                    <div className="mt-4">
                        <p className="">{description}</p>
                        <p>Redirecting to login..</p>
                    </div>
                </div>
            </div>
        )
    }

    if (status === "loading") {
        return <div>Loading...</div>;
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
