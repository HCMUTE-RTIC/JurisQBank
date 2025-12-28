import AdminLayout from "@/components/layouts/admin-layout"
import AdminDashboard from "@/components/contest-management/contest-management"
import AdminSidebar from "@/components/ui/admin-sidebar"
import ContestManagement from "@/components/contest-management/contest-management"

export default function DashboardPage() {
    return (
        <AdminLayout sidebar={<AdminSidebar />}>    
            <ContestManagement />
        </AdminLayout>
    )
}