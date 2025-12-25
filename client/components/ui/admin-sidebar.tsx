"use client"

import { signOut } from "next-auth/react"

export function AdminSidebar() {
    return <nav className="flex flex-col gap-4 bg-gray-800 text-white w-64 h-full">
        <a href="/admin/dashboard" className="flex items-center w-full h-10 hover:bg-gray-500">Dashboard</a>
        <a href="" className="flex items-center w-full h-10 hover:bg-gray-500">Dashboard</a>
        <a href="" className="flex items-center w-full h-10 hover:bg-gray-500">Dashboard</a>
        <button onClick={() => signOut()}>Sign out</button>
    </nav>
}