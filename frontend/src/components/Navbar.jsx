// frontend/src/components/NavBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  {
    to: "/",
    label: "Home",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
      </svg>
    ),
  },
  {
    to: "/timeline",
    label: "Timeline",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
      </svg>
    ),
  },
  {
    to: "/chat",
    label: "Chat",
    center: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    to: "/add",
    label: "Add",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
];

export default function NavBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-5 left-0 right-0 mx-auto max-w-md px-4 z-50">
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl"
        style={{
          background: 'rgba(18, 18, 26, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
        {navItems.map((item) => {
          const active = pathname === item.to;

          if (item.center) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-center rounded-2xl transition-all duration-300"
                style={{
                  width: 52,
                  height: 52,
                  background: active
                    ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                    : 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))',
                  boxShadow: active
                    ? '0 0 25px rgba(139,92,246,0.5)'
                    : '0 0 15px rgba(139,92,246,0.15)',
                  color: 'white',
                  marginTop: -16,
                }}
                aria-label={item.label}
              >
                {item.icon}
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300"
              style={{
                color: active ? '#c084fc' : 'var(--color-text-muted)',
                background: active ? 'rgba(139,92,246,0.1)' : 'transparent',
              }}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
