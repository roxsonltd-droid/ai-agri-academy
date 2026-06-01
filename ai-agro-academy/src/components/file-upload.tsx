"use client";

import { useState } from "react";

interface FileUploadProps {
  onUploadSuccess?: (objectKey: string, fileUrl?: string) => void;
  purpose?: "rag" | "asset";
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ 
  onUploadSuccess, 
  purpose = "asset",
  accept = ".pdf,.docx,.png,.jpg,.jpeg",
  maxSizeMB = 10
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Файлът е твърде голям (макс ${maxSizeMB}MB)`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Get Presigned URL from our backend
      const presignRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/storage/presign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Here you would normally pass the auth token (Clerk) if needed
        },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type || "application/octet-stream",
          purpose: purpose
        })
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json();
        throw new Error(errData.detail || "Грешка при генериране на линк за качване");
      }

      const { url, headers, object_key } = await presignRes.json();

      // 2. Upload directly to Cloudflare R2
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error("Качването към Cloudflare R2 се провали");
      }

      // 3. Success
      if (onUploadSuccess) {
        onUploadSuccess(object_key);
      }
      
      // Clear the input
      e.target.value = '';

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Възникна неочаквана грешка");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-3 text-emerald-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-2 text-sm text-slate-300">
            {isUploading ? "Качване..." : <><span className="font-semibold text-emerald-400">Кликнете тук</span> или плъзнете файл</>}
          </p>
          <p className="text-xs text-slate-500">Поддържани формати: {accept}</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
