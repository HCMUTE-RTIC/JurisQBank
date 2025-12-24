"use client";

import { MagicAuthLayout } from "@/components/layouts/magic-auth-layout";
import { UpdateInfoForm } from "@/components/auth/update-info-form";

export default function UpdateInfoPage() {
  return (
    <MagicAuthLayout
      title="Cập nhật thông tin"
      description="Vui lòng thêm đơn vị của bạn để tiếp tục sử dụng hệ thống."
    >
      <UpdateInfoForm />
    </MagicAuthLayout>
  );
}
