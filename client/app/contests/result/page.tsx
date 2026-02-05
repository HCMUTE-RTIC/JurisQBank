import UserLayout from "@/components/layouts/user-layout";
import Navbar from "@/components/ui/navbar";
import ResultPage from "@/components/contest/result-page";

export default function QuestionPage() {
    return (
        <UserLayout navbar={<Navbar />}>
            <ResultPage />
        </UserLayout>
    );
}