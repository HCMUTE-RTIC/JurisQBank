"use client";

import UserLayout from "@/components/layouts/user-layout";
import Navbar from "@/components/ui/navbar";
import DocumentManagement from "@/components/documents/document-management";

export default function DocumentsPage() {
    return (
        <UserLayout navbar={<Navbar />}>
            <DocumentManagement />
        </UserLayout>
    );
}