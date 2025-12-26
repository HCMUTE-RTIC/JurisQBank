import AdminLayout from "@/components/layouts/admin-layout"
import AdminDashboard from "@/components/admin-dashboard/admin-dashboard"
import AdminSidebar from "@/components/ui/admin-sidebar"

export default function DashboardPage() {
    return (
        <AdminLayout sidebar={<AdminSidebar />}>
            <AdminDashboard />
        </AdminLayout>
    )
}