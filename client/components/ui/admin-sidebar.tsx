"use client"
import { signOut } from "next-auth/react"

export default function AdminSidebar() {
    return (
        <div className="flex flex-col gap-2.5 border-r-2 border-gray-200 w-60 min-h-screen">
            <a href="/home" className="font-bold text-2xl cursor-pointer m-4">JurisQBank</a>
            <a href="" className="text-black pl-4 pt-3 hover:bg-gray-200  w-60 h-12.5 min-h-12">Dashboard</a>
            <a href="" className="text-black pl-4 pt-3 hover:bg-gray-200 w-60 h-12.5 min-h-12">Question</a>
            <a href="" className="text-black pl-4 pt-3 hover:bg-gray-200 w-60 h-12.5 min-h-12">Import</a>
            <a href="" onClick={() => signOut()} className="text-black pl-4 pt-3 hover:bg-gray-200 w-60 h-12.5 min-h-12">Sign out</a>
        </div>
    )
}