// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Notifications from './pages/NotificationsPage';
import AddIdea from './pages/AddIdea';
import IdeaDetail from './pages/IdeaDetail';
import Generator from './pages/Generator';
import Timeline from './pages/Timeline';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Header from './components/Header';
import NavBar from './components/Navbar';
import AuthLogin from './pages/AuthLogin';
import AuthVerify from './pages/AuthVerify';
import AuthCallback from './pages/AuthCallback';
import PlacesSearch from './pages/PlacesSearch';
import InvitePage from './pages/InvitePage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <div className="app-shell">
      <div className="max-w-4xl mx-auto relative" style={{ zIndex: 1 }}>
        <Header />
        <main className="px-4 pt-2 pb-4">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth/login" element={<AuthLogin />} />
            <Route path="/auth/verify" element={<AuthVerify />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Public Invite Landing Page */}
            <Route path="/invite/:token" element={<InvitePage />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddIdea /></ProtectedRoute>} />
            <Route path="/idea/:id" element={<ProtectedRoute><IdeaDetail /></ProtectedRoute>} />
            <Route path="/generator" element={<ProtectedRoute><Generator /></ProtectedRoute>} />
            <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/places" element={<ProtectedRoute><PlacesSearch /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Spacer for bottom nav */}
        <div className="h-28" aria-hidden="true" />
        <NavBar />
      </div>
    </div>
  );
}
