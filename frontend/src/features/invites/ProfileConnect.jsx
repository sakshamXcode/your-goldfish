// frontend/src/features/invite/ProfileConnect.jsx
import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import useInvite from "./useInvite";

export default function ProfileConnect() {
  const { user } = useAuthContext() || {};
  const fromUserId = user?.id || null;

  const { createInvite, loading, error } = useInvite();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Hey — join me on UsBook!");
  const [inviteLink, setInviteLink] = useState(null);
  const [status, setStatus] = useState(null);

  async function sendInvite(e) {
    e.preventDefault();
    if (!email || !fromUserId) {
      setStatus({ ok: false, text: "Login and enter a valid email address." });
      return;
    }

    const res = await createInvite(email.trim(), fromUserId, message);

    if (res?.ok) {
      setInviteLink(res.link);
      setStatus({ ok: true, text: "Invite created successfully." });
    } else {
      setStatus({ ok: false, text: res?.error || "Invite failed" });
    }
  }

  return (
    <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold">Connect a Partner</h3>

      <form onSubmit={sendInvite} className="mt-3 flex flex-col gap-3">
        <input
          type="email"
          placeholder="partner@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 border rounded-lg"
          required
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-3 border rounded-lg"
          rows={2}
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>

        {inviteLink && (
          <div className="text-sm break-all text-gray-600">
            Invite link: <a href={inviteLink}>{inviteLink}</a>
          </div>
        )}

        {(status || error) && (
          <div className={`text-sm ${status?.ok ? "text-green-600" : "text-red-600"}`}>
            {status?.text || error}
          </div>
        )}
      </form>
    </div>
  );
}
