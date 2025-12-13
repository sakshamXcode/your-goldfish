// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Notifications from './pages/Notifications';
import AddIdea from './pages/AddIdea';
import IdeaDetail from './pages/IdeaDetail';
import Generator from './pages/Generator';
import Timeline from './pages/Timeline';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import InviteAccept from './pages/InviteAccept';
import Header from './components/Header';
import NavBar from './components/Navbar';
import AuthLogin from './pages/AuthLogin';
import AuthVerify from './pages/AuthVerify';
import InviteLanding from './pages/InviteLanding';
import NotificationsPage from './pages/NotificationsPage';
import PlacesSearch from './pages/PlacesSearch';
import InvitePage from './pages/InvitePage';

export default function App() {
  return (
    <div className="app-shell max-w-4xl mx-auto">
      <Header />
      <main className="mt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/invite/:token" element={<InvitePage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/add" element={<AddIdea />} />
          <Route path="/idea/:id" element={<IdeaDetail />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/verify" element={<AuthVerify />} />
          <Route path="/invite/:token" element={<InviteLanding />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/invite/:token" element={<InviteAccept />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/places" element={<PlacesSearch />} />
        </Routes>
      </main>
{/* spacer so bottom nav does not overlap content */}
<div className="h-28" aria-hidden="true" />
<NavBar />

    </div>
  );
}
