import AdminLayout from "@/components/layouts/admin-layout"
import AdminSidebar from "@/components/ui/admin-sidebar"
import ContestManagement from "@/components/contest/contest-management"

export default function ContestManagementPage() {
    return (
        <AdminLayout sidebar={<AdminSidebar />}>
            <ContestManagement />
        </AdminLayout>
    )
}