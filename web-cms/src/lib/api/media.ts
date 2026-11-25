import { MediaStorageFolder, MediaStorageStatus, MediaUploadResult } from '@/types';
import { ENV } from '@/config/env';
import { API_BASE_URL, fetchApi, getAdminAuthHeaders } from './client';

export async function getMediaStatus(): Promise<MediaStorageStatus> {
  try {
    const res = await fetchApi<MediaStorageStatus>('/media/status');
    if (res?.data) return res.data;
  } catch {
    // Fallback status when backend is offline
  }
  return {
    storageMode: ENV.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local-fallback',
    provider: ENV.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local',
    isCloudinaryConfigured: Boolean(ENV.CLOUDINARY_CLOUD_NAME),
    cloudName: ENV.CLOUDINARY_CLOUD_NAME,
    bucket: ENV.CLOUDINARY_CLOUD_NAME || 'cloudinary-media',
    region: 'global-cdn',
    publicBaseUrl: ENV.MEDIA_BASE_URL,
    maxFileSizeMb: 10,
    folders: ['landing', 'products', 'materials', 'custom-previews'],
  };
}

export async function uploadMediaFile(
  file: File,
  folder: MediaStorageFolder = 'products'
): Promise<MediaUploadResult> {
  const requiresAdmin = folder === 'landing' || folder === 'products' || folder === 'materials';
  const authHeaders = requiresAdmin ? await getAdminAuthHeaders() : {};

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: { ...authHeaders },
      body: formData,
    });

    const json = await res.json().catch(() => ({}));
    if (res.ok && (json?.data?.url || json?.data?.publicUrl)) {
      return {
        ...json.data,
        url: json.data.url || json.data.publicUrl,
      } as MediaUploadResult;
    }
  } catch {
    // Proceed to direct Cloudinary unsigned upload or presigned URL fallback
  }

  if (ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_UPLOAD_PRESET) {
    try {
      const cloudForm = new FormData();
      cloudForm.append('file', file);
      cloudForm.append('upload_preset', ENV.CLOUDINARY_UPLOAD_PRESET);
      cloudForm.append('folder', `wavo/${folder}`);
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: cloudForm }
      );
      const cloudJson = await cloudRes.json();
      if (cloudRes.ok && cloudJson?.secure_url) {
        return {
          url: cloudJson.secure_url,
          publicUrl: cloudJson.secure_url,
          key: cloudJson.public_id,
          publicId: cloudJson.public_id,
          folder,
          storageMode: 'cloudinary',
          contentType: file.type || 'image/jpeg',
          size: file.size,
        };
      }
    } catch {
      // Fallback to presigned URL
    }
  }

  try {
    const presignRes = await fetchApi<{
      uploadUrl: string;
      publicUrl: string;
      key: string;
      folder: string;
      storageMode?: 'cloudinary' | 'local-fallback';
    }>('/media/presigned-url', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'image/jpeg',
        folder,
      }),
    });

    if (presignRes?.data?.uploadUrl) {
      await fetch(presignRes.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      });

      return {
        url: presignRes.data.publicUrl,
        key: presignRes.data.key,
        folder: presignRes.data.folder || folder,
        storageMode: presignRes.data.storageMode || 'cloudinary',
        contentType: file.type || 'image/jpeg',
        size: file.size,
      };
    }
  } catch {
    // Fallback to client DataURL preview
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  return {
    url: dataUrl,
    key: `${folder}/${Date.now()}-${file.name}`,
    folder,
    storageMode: 'local-fallback',
    contentType: file.type || 'image/jpeg',
    size: file.size,
  };
}
