"use client"

interface AdminLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

function AdminRoleCheck() {
    // Implement role checking logic here
    return true; // Placeholder: allow access for now
}

export function AdminLayout({ children, sidebar  }: AdminLayoutProps) {
    return (
        AdminRoleCheck() ? (
                    <div className="flex min-h-screen">
            <aside>{sidebar}</aside>
            <main>
                {children}
            </main>
        </div>
    ) : (<div>You do not have access to this page.</div>)
    )
}
