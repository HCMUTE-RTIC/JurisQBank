import { AdminSidebar } from '@/components/ui/admin-sidebar'
import { AdminLayout }  from '@/components/layouts/admin-layout'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export default function AdminDashboardPage() {
    return (
        <AdminLayout sidebar={<AdminSidebar />}>
            <AdminDashboard />
        </AdminLayout>
    )   
}