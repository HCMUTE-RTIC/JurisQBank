import AdminLayout from "@/components/layouts/admin-layout"
import QuestionCreate from "@/components/question-management/question-create"
import AdminSidebar from "@/components/ui/admin-sidebar";

export default function QuestionManagementPage () {
    return(
        <AdminLayout sidebar={<AdminSidebar/>}>
            <QuestionCreate />
        </AdminLayout>
    )
}