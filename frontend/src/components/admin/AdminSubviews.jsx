import React, { useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaCheck,
  FaTimes,
  FaRegCopy,
  FaShieldAlt,
  FaUserCheck,
  FaBan,
  FaFileDownload,
  FaKey,
  FaServer,
  FaCubes,
  FaExternalLinkAlt,
  FaBook,
  FaHeadset,
} from "react-icons/fa";

// 1. Users View
export function UsersView({ users, onToggleUserStatus, showToast }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">User Management</h3>
          <p className="text-xs text-slate-500">
            Registered account holders with consent-sharing authorization
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 sm:w-64"
            />
            <FaSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto mt-4">
        <table className="w-full min-w-[650px] text-left border-collapse text-xs">
          <thead>
            <tr className="text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-100">
              <th className="py-3 px-3">Name & Email</th>
              <th className="py-3 px-3">Linked Accounts</th>
              <th className="py-3 px-3">Active Consents</th>
              <th className="py-3 px-3">Member Since</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {u.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3 font-medium text-slate-700">
                  {u.linkedAccounts || 2} Bank(s)
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[11px]">
                    {u.activeConsents || 1}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-slate-500">{u.joined || "2025"}</td>
                <td className="py-3.5 px-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                      u.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {u.status || "Active"}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => {
                      if (onToggleUserStatus) onToggleUserStatus(u.id);
                      if (showToast)
                        showToast(`User ${u.name} status updated.`);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    {u.status === "Suspended" ? "Activate" : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 2. Consents View
export function ConsentsView({ consents, onRevokeConsent, showToast }) {
  const [filter, setFilter] = useState("ALL");

  const filtered = consents.filter((c) => {
    if (filter === "ALL") return true;
    return c.status === filter;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Consent Artefacts
          </h3>
          <p className="text-xs text-slate-500">
            Immutable user authorization records anchored to the blockchain
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "APPROVED", "REVOKED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto mt-4">
        <table className="w-full min-w-[700px] text-left border-collapse text-xs">
          <thead>
            <tr className="text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-100">
              <th className="py-3 px-3">Consent ID</th>
              <th className="py-3 px-3">User</th>
              <th className="py-3 px-3">FIU Entity</th>
              <th className="py-3 px-3">Purpose</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Validity</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-3 font-mono font-bold text-blue-700">
                  {c.id}
                </td>
                <td className="py-3.5 px-3 font-medium text-slate-800">
                  {c.user}
                </td>
                <td className="py-3.5 px-3 text-slate-600 font-medium">{c.fiu}</td>
                <td className="py-3.5 px-3 text-slate-500 max-w-[180px] truncate">
                  {c.purpose}
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      c.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-slate-500">{c.expires}</td>
                <td className="py-3.5 px-3 text-right">
                  {c.status === "APPROVED" ? (
                    <button
                      onClick={() => {
                        if (onRevokeConsent) onRevokeConsent(c.id);
                        if (showToast)
                          showToast(`Consent ${c.id} revoked on-chain!`);
                      }}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      Revoke
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Archived
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3. FIUs View
export function FiusView({ fius }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fadeIn">
      <div className="pb-6 border-b border-slate-100 mb-5">
        <h3 className="text-lg font-bold text-slate-900">
          Financial Information Users (FIUs)
        </h3>
        <p className="text-xs text-slate-500">
          Licensed financial institutions certified to query account aggregator data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fius.map((fiu) => (
          <div
            key={fiu.id}
            className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                {fiu.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {fiu.status}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900">{fiu.name}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Lic: {fiu.license}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Requests</span>
                <span className="font-bold text-slate-800">
                  {fiu.activeRequests}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">API Health</span>
                <span className="font-bold text-emerald-600">{fiu.health}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Revocations View
export function RevocationsView({ auditLogs }) {
  const revocations = auditLogs.filter((l) => l.action.includes("REVOKED"));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fadeIn">
      <div className="pb-6 border-b border-slate-100 mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          Consent Revocation Ledger
        </h3>
        <p className="text-xs text-slate-500">
          User-initiated consent cancellations written immutably to the blockchain
        </p>
      </div>

      <div className="space-y-3">
        {revocations.map((rev) => (
          <div
            key={rev.id}
            className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{rev.user}</span>
                <span className="text-rose-600 font-bold bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                  REVOKED
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                FIU: {rev.fiu} | Timestamp: {rev.timestamp}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-slate-400 block text-[10px]">
                Blockchain Verification Hash
              </span>
              <span className="font-mono text-blue-600 text-xs font-semibold">
                {rev.truncatedTx}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. System Settings View
export function SettingsView({
  isLiveUpdating,
  setIsLiveUpdating,
  showToast,
}) {
  const [pollInterval, setPollInterval] = useState("10");

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fadeIn max-w-2xl">
      <div className="pb-5 border-b border-slate-100 mb-6">
        <h3 className="text-lg font-bold text-slate-900">System Settings</h3>
        <p className="text-xs text-slate-500">
          Admin portal preferences and node connection parameters
        </p>
      </div>

      <div className="space-y-6 text-xs">
        {/* Toggle Real World Sync */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <h5 className="font-bold text-slate-800 text-sm">
              Real-World RPC & Backend Polling
            </h5>
            <p className="text-slate-500 text-xs mt-0.5">
              Automatically stream updates from Polygon RPC and Spring Boot Aggregator
            </p>
          </div>
          <button
            onClick={() => {
              setIsLiveUpdating(!isLiveUpdating);
              if (showToast)
                showToast(
                  `Real-world polling set to ${!isLiveUpdating ? "ON" : "OFF"}`
                );
            }}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              isLiveUpdating ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Polling Frequency */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Polling Interval (seconds)
          </label>
          <select
            value={pollInterval}
            onChange={(e) => {
              setPollInterval(e.target.value);
              if (showToast) showToast(`Interval set to ${e.target.value}s`);
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="5">Every 5 Seconds (High Frequency)</option>
            <option value="10">Every 10 Seconds (Recommended)</option>
            <option value="30">Every 30 Seconds (Low Network)</option>
          </select>
        </div>

        {/* Node RPC Endpoint */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Web3 RPC Provider
          </label>
          <input
            type="text"
            readOnly
            value="https://rpc-amoy.polygon.technology"
            className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 text-xs cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}

// 6. API Management View
export function ApiManagementView({ showToast }) {
  const [copiedKey, setCopiedKey] = useState(false);

  const apiKey = "cc_live_99f8a02c81da4f92083bc716e10091aa";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fadeIn max-w-2xl">
      <div className="pb-5 border-b border-slate-100 mb-6">
        <h3 className="text-lg font-bold text-slate-900">API Management</h3>
        <p className="text-xs text-slate-500">
          Secure developer credentials for FIP/FIU integrations
        </p>
      </div>

      <div className="space-y-5 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Master Administrator API Key
          </label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              readOnly
              value={apiKey}
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                setCopiedKey(true);
                if (showToast) showToast("API Key copied to clipboard!");
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedKey ? <FaCheck /> : <FaRegCopy />}
              <span>Copy</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 leading-relaxed">
          <p className="font-bold mb-1">API Webhook Endpoints</p>
          <p className="text-[11px] text-blue-800">
            Consent callbacks: <code className="font-mono">POST /api/v1/consents/callback</code>
          </p>
          <p className="text-[11px] text-blue-800 mt-1">
            Data transmission: <code className="font-mono">POST /api/v1/fiu/data/receive</code>
          </p>
        </div>
      </div>
    </div>
  );
}

// 7. Support View
export function SupportView() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fadeIn max-w-2xl">
      <div className="pb-5 border-b border-slate-100 mb-6">
        <h3 className="text-lg font-bold text-slate-900">Admin Support & Docs</h3>
        <p className="text-xs text-slate-500">
          ConsentChain Account Aggregator system documentation
        </p>
      </div>

      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
            <FaBook className="text-blue-600" />
            <span>Account Aggregator (AA) Ecosystem Guidelines</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            ConsentChain complies with RBI Master Directions on Account Aggregators. Consents are user-centric, encrypted end-to-end, and cryptographically verified on-chain.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
            <FaHeadset className="text-purple-600" />
            <span>Technical Escalation</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Engineering Team: <span className="font-mono text-blue-600 font-semibold">devops@consentchain.io</span>
          </p>
        </div>
      </div>
    </div>
  );
}
