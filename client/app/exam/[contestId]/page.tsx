"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ExamRunner } from "@/components/exam/exam-runner";

export default function ExamPage({
  params,
}: {
  params: { contestId: string };
}) {
  const searchParams = useSearchParams();
  const forceMock = useMemo(
    () => searchParams.get("mock") === "1",
    [searchParams]
  );

  return <ExamRunner contestId={params.contestId} forceMock={forceMock} />;
}
