'use client';

import { useRef, useState } from 'react';
import { FileText, Paperclip, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUploadAttachment } from '@/hooks/use-tasks';
import { getApiErrorMessage } from '@/lib/api-client';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

function isImage(url: string) {
  return IMAGE_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext));
}

export function AttachmentCard({ taskId, attachmentUrl }: { taskId: string; attachmentUrl?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useUploadAttachment(taskId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    upload.mutate(file, {
      onError: (err) => setError(getApiErrorMessage(err, 'Upload failed')),
    });
    e.target.value = '';
  };

  return (
    <Card className="p-4">
      <p className="eyebrow mb-3">Attachment</p>

      {attachmentUrl ? (
        isImage(attachmentUrl) ? (
          <a href={attachmentUrl} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachmentUrl}
              alt="Task attachment"
              className="mb-3 max-h-48 w-full rounded-md border border-line object-cover"
            />
          </a>
        ) : (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="mb-3 flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-2 text-sm text-navy hover:underline"
          >
            <FileText className="h-4 w-4" /> View attached file
          </a>
        )
      ) : (
        <p className="mb-3 flex items-center gap-2 text-sm text-faint">
          <Paperclip className="h-4 w-4" /> No file attached yet.
        </p>
      )}

      <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
      <Button variant="secondary" className="w-full" loading={upload.isPending} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" /> {attachmentUrl ? 'Replace file' : 'Upload file'}
      </Button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </Card>
  );
}
