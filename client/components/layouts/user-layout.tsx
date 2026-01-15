import { div } from "motion/react-client"

interface UserLayoutProps {
    children: React.ReactNode
    navbar?: React.ReactNode
}

export default function UserLayout({ children, navbar }: UserLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <header>{navbar}</header>
            <main className="flex-1">{children}</main>
        </div>
    )
}