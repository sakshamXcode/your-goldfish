// frontend/src/components/NavBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationsBell from "./NotificationsBell";

function IconButton({ children, to, active, label }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`p-2 rounded-lg text-sm flex items-center justify-center ${
        active ? "bg-[#FFF0F6] text-[#FF6FAF]" : "text-[#6E6E6E]"
      }`}
    >
      {children}
    </Link>
  );
}

export default function NavBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-6 left-0 right-0 mx-auto max-w-4xl px-6 z-50">
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-3 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <IconButton to="/" active={pathname === "/"} label="Home">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" /></svg>
          </IconButton>

          <div className="flex items-center">
            <NotificationsBell />
          </div>

          <IconButton to="/timeline" active={pathname === "/timeline"} label="Timeline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" /></svg>
          </IconButton>
        </div>

        <div className="flex items-center justify-center">
          <Link to="/chat" className="w-16 h-16 bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] rounded-full shadow-md flex items-center justify-center text-white text-2xl" aria-label="Open chat">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          </Link>
        </div>

        <div className="flex gap-2 items-center">
          <Link to="/add" className="px-4 py-2 rounded-full bg-white border border-[#EFEFF2] text-[#6E6E6E] shadow-sm" aria-label="Add an idea">
            Add an idea
          </Link>
        </div>
      </div>
    </nav>
  );
}
