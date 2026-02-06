"use client";

import React from "react";
import {
  Button,
  Result,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Divider,
} from "antd";
import {
  HomeOutlined,
  RedoOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";

const { Text, Paragraph } = Typography;

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestIdParam = searchParams?.get("contestId") ?? undefined;

  // mock contest and result data
  const contestData = {
    id: contestIdParam ?? "mock-contest-001",
    max_attempts: 4,
    is_practice: true,
  };

  const resultData = {
    score: 85,
    totalScore: 100,
    totalQuestions: 20,
    correct: 17,
    wrong: 2,
    skipped: 1,
    timeTaken: "14 phút 30 giây",
    passingScore: 50,
    attemptsUsed: 1,
  };

  const isPassed = resultData.score >= resultData.passingScore;
  const remainingAttempts = Math.max(
    0,
    contestData.max_attempts - resultData.attemptsUsed,
  );
  const showRetryButton = contestData.max_attempts > 1;
  const showViewAnswersButton = contestData.is_practice === true;

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(`exam:${contestData.id}:v1`);
      } catch {
        // ignore storage errors
      }
    }

    router.push(`/exam/${contestData.id}?reset=1`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center relative overflow-hidden">
      <Card className="w-full max-w-3xl shadow-xl rounded-2xl border-none">
        {/* Main */}
        <Result
          status={isPassed ? "success" : "error"}
          icon={
            <div className="flex justify-center mb-6">
              {/* Points */}
              <Progress
                type="circle"
                percent={(resultData.score / resultData.totalScore) * 100}
                format={() => (
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-3xl font-bold ${isPassed ? "text-green-600" : "text-red-500"}`}
                    >
                      {resultData.score}
                    </span>
                    <span className="text-xs text-gray-400">
                      / {resultData.totalScore} điểm
                    </span>
                  </div>
                )}
                size={140}
                strokeColor={isPassed ? "#52c41a" : "#ff4d4f"}
                strokeWidth={8}
              />
            </div>
          }
          title={
            <span
              className={`text-2xl font-bold ${isPassed ? "text-green-600" : "text-red-600"}`}
            >
              {isPassed
                ? "Chúc mừng! Bạn đã vượt qua bài thi"
                : "Rất tiếc! Bạn chưa đạt yêu cầu"}
            </span>
          }
          subTitle={
            <Text type="secondary" className="text-base">
              {isPassed
                ? "Bạn đã thể hiện rất xuất sắc. Hãy giữ vững phong độ này nhé!"
                : "Đừng nản lòng, hãy ôn tập lại kiến thức và thử lại lần sau."}
            </Text>
          }
          // 4. Action buttons
          extra={[
            <div
              key="actions"
              className="flex flex-col sm:flex-row gap-4 justify-center mt-4"
            >
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={() => router.push("/")}
              >
                Về trang chủ
              </Button>
              {showRetryButton ? (
                <div className="flex flex-col items-center gap-1">
                  <Button
                    size="large"
                    icon={<RedoOutlined />}
                    onClick={handleRetry}
                  >
                    Làm lại bài
                  </Button>
                  <Text type="secondary" className="text-xs">
                    Còn {remainingAttempts} lượt làm
                  </Text>
                </div>
              ) : null}
              {showViewAnswersButton ? (
                <Button size="large" icon={<EyeOutlined />}>
                  Xem đáp án chi tiết
                </Button>
              ) : null}
            </div>,
          ]}
        >
          <Divider dashed />

          {/* 5. Detailed Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <Row gutter={[24, 24]} justify="center">
              <Col xs={12} sm={6}>
                <Statistic
                  title={
                    <span className="text-gray-500 text-sm">Số câu hỏi</span>
                  }
                  value={resultData.totalQuestions}
                  style={{ color: "#3f8600", fontWeight: "bold" }}
                  prefix={<QuestionCircleOutlined />}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Statistic
                  title={
                    <span className="text-gray-500 text-sm">Số câu đúng</span>
                  }
                  value={resultData.correct}
                  style={{ color: "#3f8600", fontWeight: "bold" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Statistic
                  title={
                    <span className="text-gray-500 text-sm">Số câu sai</span>
                  }
                  value={resultData.wrong}
                  style={{ color: "#cf1322", fontWeight: "bold" }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Statistic
                  title={<span className="text-gray-500 text-sm">Bỏ qua</span>}
                  value={resultData.skipped}
                  style={{ color: "#faad14", fontWeight: "bold" }}
                  prefix={<StopOutlined />}
                />
              </Col>

              <Col xs={12} sm={12}>
                <Statistic
                  title={
                    <span className="text-gray-500 text-sm">Thời gian</span>
                  }
                  value={resultData.timeTaken}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
          </div>

          {/* Footer*/}
          <div className="mt-8 text-center bg-blue-50 p-4 rounded-lg">
            <Paragraph className="mb-0 text-blue-700">
              Kết quả đã được lưu vào hệ thống lúc{" "}
              <b>{new Date().toLocaleString()}</b>
            </Paragraph>
          </div>
        </Result>
      </Card>
    </div>
  );
}
