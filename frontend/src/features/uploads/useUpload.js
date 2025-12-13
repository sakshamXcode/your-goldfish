// frontend/src/features/uploads/useUpload.js
import { useState, useCallback } from "react";

export default function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upload = useCallback(async (file) => {
    if (!file) throw new Error("No file provided");
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || "Upload failed");
      }

      return json.file; // { path, url }
    } catch (e) {
      console.error("upload failed", e);
      setError(e.message || "Upload failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { upload, loading, error };
}
