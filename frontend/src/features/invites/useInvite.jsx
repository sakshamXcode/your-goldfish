// frontend/src/features/invites/useInvite.jsx
import { useState, useCallback } from "react";
import { getCodeAPI, requestPartnerAPI } from "../../lib/api";

export default function useInvite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const code = await getCodeAPI();
      return code;
    } catch (err) {
      setError(err.message || "Failed to load code");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPartner = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await requestPartnerAPI(code);
      if (!resp?.ok) {
        setError(resp?.error || "Failed to send partner request");
        return false;
      }
      return true;
    } catch (err) {
      let msg = err.message || "Request failed";
      // Provide friendlier error messages
      if (msg === "code_not_found") msg = "That connection code does not exist.";
      if (msg === "cant_invite_self") msg = "You cannot pair with yourself.";
      if (msg === "user_already_partnered") msg = "This user is already paired with someone.";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getCode, requestPartner, loading, error };
}
