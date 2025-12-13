// frontend/src/features/preview/useLinkPreview.js
import { useEffect, useState } from "react";

function isProbablyUrl(value) {
  if (!value) return false;
  // very basic check
  return value.startsWith("http://") || value.startsWith("https://");
}

export default function useLinkPreview(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let timeoutId;

    if (!isProbablyUrl(url)) {
      setData(null);
      setError("");
      setLoading(false);
      return;
    }

    // small debounce so we don’t fire on every keystroke
    timeoutId = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (!active) return;

        if (json && json.ok !== false) {
          // server might return { title, description, image, site_name, url }
          setData(json.data || json);
        } else {
          setError(json.error || "Preview failed");
          setData(null);
        }
      } catch (e) {
        if (!active) return;
        console.error("preview failed", e);
        setError("Preview failed");
        setData(null);
      } finally {
        if (active) setLoading(false);
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [url]);

  return { data, loading, error };
}
