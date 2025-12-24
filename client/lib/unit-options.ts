export type UnitOptions = Record<string, string[]>;

// Fixed options for "Khoa" -> "Ngành".
// Edit this file to match your school's real structure.
export const UNIT_OPTIONS: UnitOptions = {
  "Khoa Công nghệ Thông tin": [
    "Công nghệ Thông tin",
    "Kỹ thuật Phần mềm",
    "Hệ thống Thông tin",
    "Khoa học Máy tính",
    "An toàn Thông tin",
    "Trí tuệ Nhân tạo",
  ],
  "Khoa Cơ khí Chế tạo máy": [
    "Công nghệ Chế tạo máy",
    "Kỹ thuật Cơ khí",
    "Cơ điện tử",
    "Công nghệ Kỹ thuật Khuôn mẫu",
  ],
  "Khoa Cơ khí Động lực": [
    "Công nghệ Kỹ thuật Ô tô",
    "Công nghệ Kỹ thuật Nhiệt",
    "Công nghệ Kỹ thuật Tàu thủy",
  ],
  "Khoa Điện – Điện tử": [
    "Công nghệ Kỹ thuật Điện – Điện tử",
    "Công nghệ Kỹ thuật Điện tử – Viễn thông",
    "Kỹ thuật Điều khiển và Tự động hóa",
    "Kỹ thuật Robot",
  ],
  "Khoa Công nghệ Hóa học và Thực phẩm": [
    "Công nghệ Thực phẩm",
    "Công nghệ Hóa học",
    "Công nghệ Sinh học",
  ],
  "Khoa Công nghệ May và Thời trang": ["Công nghệ May", "Thiết kế Thời trang"],
  "Khoa In và Truyền thông": ["Công nghệ In", "Truyền thông Đa phương tiện"],
  "Khoa Kinh tế": [
    "Quản trị Kinh doanh",
    "Kế toán",
    "Tài chính – Ngân hàng",
    "Thương mại Điện tử",
  ],
  "Khoa Ngoại ngữ": ["Ngôn ngữ Anh", "Ngôn ngữ Trung Quốc"],
  "Khoa Xây dựng": ["Công nghệ Kỹ thuật Xây dựng", "Quản lý Xây dựng"],
  "Khoa Công nghệ Vật liệu": [
    "Công nghệ Kỹ thuật Vật liệu",
    "Công nghệ Vật liệu Polymer",
  ],
  "Khoa Sư phạm Kỹ thuật": [
    "Sư phạm Kỹ thuật Điện – Điện tử",
    "Sư phạm Kỹ thuật Cơ khí",
    "Sư phạm Kỹ thuật Công nghệ Thông tin",
  ],
};

export const UNIT_DELIMITER = " - ";

export function formatUnit(faculty: string, major: string) {
  return `${faculty}${UNIT_DELIMITER}${major}`;
}

export function parseUnit(unit?: string): { faculty: string; major: string } {
  if (!unit) return { faculty: "", major: "" };
  const parts = unit.split(UNIT_DELIMITER);
  if (parts.length < 2) return { faculty: "", major: "" };
  const faculty = parts[0]?.trim() ?? "";
  const major = parts.slice(1).join(UNIT_DELIMITER).trim();
  return { faculty, major };
}
