"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;

  cancelText?: string;
  confirmText: string;

  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;

  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  cancelText = "Hủy",
  confirmText,
  confirmVariant = "secondary",
  confirmDisabled,
  cancelDisabled,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border bg-background shadow-lg">
        <div className="space-y-2 p-5">
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>

        <div className="flex justify-end gap-2 border-t p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={cancelDisabled}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
