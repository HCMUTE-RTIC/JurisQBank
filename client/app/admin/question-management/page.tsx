import AdminLayout from "@/components/layouts/admin-layout"
import QuestionManagement from "@/components/question-management/question-management"
import AdminSidebar from "@/components/ui/admin-sidebar";

export default function QuestionManagementPage () {
    return(
        <AdminLayout sidebar={<AdminSidebar/>}>
            <QuestionManagement />
        </AdminLayout>
    )
}