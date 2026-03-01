import React from "react";
import { useAuthContext } from "../contexts/AuthContext";

export default function RelationshipHeader({ subtitle }) {
  const { user } = useAuthContext();
  const isPaired = Boolean(user?.pair_id);
  const partnerName = user?.partner_name || user?.partner?.name || "Your partner";

  return (
    <div className="mb-6 glass-card-static p-5" style={{
      background: isPaired
        ? 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06), rgba(59,130,246,0.04))'
        : 'rgba(255,255,255,0.03)',
    }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-aurora-purple)' }}>
            {isPaired ? "Connected" : "Status"}
          </div>
          <div className="text-lg font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
            {isPaired ? (
              <>You <span className="mx-1">💞</span> {partnerName}</>
            ) : (
              "Not paired yet"
            )}
          </div>
          <div className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {isPaired
              ? subtitle || "Shared ideas, shared moments"
              : "Invite your partner to start building together"}
          </div>
        </div>
        <div className="text-3xl animate-float">
          {isPaired ? "💑" : "🕊️"}
        </div>
      </div>
    </div>
  );
}
