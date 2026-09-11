'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
export function ProfileUploader({
  disabled,
  onUploaded,
  onBusy,
  label = 'UPLOAD PROFILE PHOTO',
}: {
  label?: string;
  disabled: boolean;
  onUploaded: (url: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(''),
    [message, setMessage] = useState('');
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  async function upload(file?: File) {
    if (!file || busy || disabled) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 15 * 1024 * 1024
    ) {
      setMessage('ERROR // JPEG, PNG or WebP, maximum 15 MB.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    onBusy(true);
    setMessage('Uploading...');
    try {
      const db = getSupabase();
      if (!db) throw new Error('Upload unavailable in demo mode.');
      const extension = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      }[file.type];
      const path = `members/${crypto.randomUUID()}.${extension}`;
      const { error } = await db.storage
        .from('site-media')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      onUploaded(
        db.storage.from('site-media').getPublicUrl(path).data.publicUrl,
      );
      setMessage(
        'SUCCESS // Photo uploaded. Select SAVE CHANGES to save it to this member.',
      );
    } catch (e) {
      setMessage('ERROR // ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }
  return (
    <div className="uploader">
      <label>
        {label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || disabled}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>
      {preview && (
        <img
          className="member-photo-preview"
          src={preview}
          alt="Selected member portrait"
        />
      )}
      <output>{message}</output>
    </div>
  );
}
