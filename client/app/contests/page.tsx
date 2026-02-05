import UserLayout from "@/components/layouts/user-layout";
import Navbar from "@/components/ui/navbar";
import ContestForm from "@/components/contest/contest-form";

export default function QuestionPage() {
    return (
        <UserLayout navbar={<Navbar />}>
            <ContestForm />
        </UserLayout>
    );
}