import { ExamRunner } from "@/components/exam/exam-runner";

export default function ExamPage({
  params,
}: {
  params: { contestId: string };
}) {
  return <ExamRunner contestId={params.contestId} />;
}
