'use client';

import React, { useRef, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/HStack';
import { Icon } from '@astryxdesign/core/Icon';
import { StackItem } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { VStack } from '@astryxdesign/core/VStack';
import { uploadMediaFile } from '@/lib/api';
import { resolveAssetUrl, ASSETS } from '@/config/assets';
import type { MediaStorageFolder } from '@/types';
import { useI18n } from '@/i18n/I18nContext';

export interface S3ImageUploaderProps {
  value: string;
  onChange: (newUrl: string) => void;
  folder: MediaStorageFolder;
  label?: string;
  compact?: boolean;
  className?: string;
}

export function S3ImageUploader({
  value,
  onChange,
  folder,
  label,
  compact = false,
}: S3ImageUploaderProps) {
  const { locale } = useI18n();
  const isEn = locale === 'en';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const resolvedPreview = resolveAssetUrl(value, ASSETS.placeholders.product);

  const handleFileUpload = async (file?: File | null) => {
    if (!file) return;
    setIsUploading(true);
    setUploadNotice(null);
    try {
      const result = await uploadMediaFile(file, folder);
      onChange(result.url);
      setUploadNotice(
        isEn ? 'Uploaded to Cloudinary' : 'Đã tải ảnh lên Cloudinary thành công'
      );
      setTimeout(() => setUploadNotice(null), 3500);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await handleFileUpload(file);
    }
  };

  const isCloudinaryUrl =
    value?.includes('res.cloudinary.com') || value?.includes('cloudinary.com');

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Card variant={isDragging ? 'muted' : 'default'}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
            <Text type="label">
              {label ||
                (isEn
                  ? `Product Image (Cloudinary / ${folder})`
                  : `Hình ảnh sản phẩm (Cloudinary / ${folder})`)}
            </Text>
            <Badge
              variant={isCloudinaryUrl ? 'blue' : 'neutral'}
              label={`Cloudinary • ${folder}`}
            />
          </HStack>

          <HStack gap={3} vAlign="start" wrap="wrap">
            <div
              style={{
                width: compact ? 84 : 112,
                height: compact ? 84 : 112,
                borderRadius: 10,
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--color-border)',
                background: 'var(--color-background-surface)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedPreview}
                alt={label || 'Preview'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            <StackItem size="fill">
              <VStack gap={2}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    style={{ display: 'none' }}
                  />
                  <Button
                    label={
                      isUploading
                        ? isEn
                          ? 'Uploading...'
                          : 'Đang tải lên...'
                        : isEn
                        ? 'Upload to Cloudinary'
                        : 'Tải ảnh lên Cloudinary'
                    }
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon="upload" />}
                    isLoading={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  />
                  {value && (
                    <Button
                      label={isEn ? 'View Original' : 'Xem ảnh gốc'}
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon="externalLink" />}
                      href={resolvedPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  )}
                  {uploadNotice && <Badge variant="green" label={uploadNotice} />}
                </HStack>

                <TextInput
                  type="url"
                  size="sm"
                  label={isEn ? 'Cloudinary Image URL' : 'Đường dẫn URL hình ảnh Cloudinary'}
                  isLabelHidden
                  value={value || ''}
                  onChange={(val) => onChange(val)}
                  placeholder="https://res.cloudinary.com/fbemz6fi/image/upload/..."
                  hasClear
                  width="100%"
                />

                {!compact && (
                  <Text type="supporting">
                    {isEn
                      ? 'Drag & drop an image file here or click Upload to store directly on Cloudinary.'
                      : 'Kéo thả tệp ảnh vào khung này hoặc bấm nút tải lên để lưu trực tiếp lên Cloudinary.'}
                  </Text>
                )}
              </VStack>
            </StackItem>
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}
