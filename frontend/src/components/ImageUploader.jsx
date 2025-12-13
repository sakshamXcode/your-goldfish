// frontend/src/components/ImageUploader.jsx
import React, { useRef, useState } from "react";
import useUpload from "../features/uploads/useUpload";

export default function ImageUploader({ onUploaded }) {
  const inputRef = useRef();
  const [localPreview, setLocalPreview] = useState(null);
  const { upload, loading, error } = useUpload();

  async function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLocalPreview(URL.createObjectURL(f));

    try {
      const uploaded = await upload(f);
      // uploaded.url contains public URL
      if (onUploaded) onUploaded(uploaded);
    } catch (err) {
      // error state handled by hook
      console.warn("upload error:", err);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Image</label>
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 rounded-lg bg-[#F8F6F9] flex items-center justify-center overflow-hidden">
          {localPreview ? (
            <img src={localPreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-xs text-gray-400">No image</div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1 rounded-full bg-white border text-sm"
            >
              Choose image
            </button>
            {loading && <div className="text-sm text-gray-500">Uploading…</div>}
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
        </div>
      </div>
    </div>
  );
}
