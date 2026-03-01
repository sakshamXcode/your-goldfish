// frontend/src/components/Header.jsx
import { Link } from "react-router-dom";
import NotificationsBell from "./NotificationsBell";
import { useAuthContext } from "../contexts/AuthContext";

export default function Header() {
  const { user } = useAuthContext();

  return (
    <header className="sticky top-0 z-40 px-5 py-4" style={{
      background: 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.04)'
    }}>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl animate-float"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}>
            🐠
          </div>
          <div>
            <h1 className="text-lg font-bold text-aurora" style={{ lineHeight: 1.2 }}>
              Your Goldfish
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Catch every idea
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationsBell
            to_email={user?.email || null}
            user_id={user?.id || null}
          />
          <Link
            to="/profile"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            aria-label="Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
