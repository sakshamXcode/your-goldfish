import { useEffect, useState } from "react";

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
    fetch(`/api/partner_get?user_id=${user_id}`)
      .then((r) => r.json())
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
