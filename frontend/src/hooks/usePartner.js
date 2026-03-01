import { useEffect, useState } from "react";
import { jsonFetch } from "../lib/api";

export default function usePartner(user_id) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user_id) {
      setPartner(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    jsonFetch(`/partner_get`)
      .then((j) => {
        setPartner(j.partner || null);
      })
      .catch(() => {
        setPartner(null);
      })
      .finally(() => setLoading(false));
  }, [user_id]);

  return { partner, loading };
}
