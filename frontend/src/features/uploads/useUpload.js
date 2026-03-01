import { useState, useCallback } from "react";
import { uploadImageAPI } from "../../lib/api";

export default function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upload = useCallback(async (file) => {
    if (!file) throw new Error("No file provided");
    setLoading(true);
    setError("");
    try {
      const json = await uploadImageAPI(file);
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
