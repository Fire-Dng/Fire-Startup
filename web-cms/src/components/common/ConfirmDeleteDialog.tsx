'use client';

import React from 'react';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';

export interface DeleteTarget {
  type: 'category' | 'product' | 'material';
  id: string;
  name: string;
}

export interface ConfirmDeleteDialogProps {
  target: DeleteTarget | null;
  onClose: () => void;
  onConfirm: () => void;
  isEn: boolean;
  cancelLabel: string;
}

export function ConfirmDeleteDialog({
  target,
  onClose,
  onConfirm,
  isEn,
  cancelLabel,
}: ConfirmDeleteDialogProps) {
  const typeLabelVi =
    target?.type === 'category'
      ? 'danh mục'
      : target?.type === 'product'
        ? 'sản phẩm'
        : 'nguyên liệu';

  return (
    <AlertDialog
      isOpen={Boolean(target)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={isEn ? `Delete ${target?.type}?` : `Xóa ${typeLabelVi}?`}
      description={
        isEn
          ? `Are you sure you want to delete "${target?.name}" from the catalog?`
          : `Bạn có chắc chắn muốn xóa "${target?.name}" khỏi danh mục hệ thống?`
      }
      actionLabel={isEn ? 'Delete' : `Xóa ${typeLabelVi}`}
      cancelLabel={cancelLabel}
      actionVariant="destructive"
      onAction={onConfirm}
    />
  );
}
