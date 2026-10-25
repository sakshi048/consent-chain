import React, { useState } from "react";
import { FaRegCopy, FaCheck, FaUserCircle } from "react-icons/fa";

export default function AuditLogsTable({
  logs = [],
  onViewAllLogs,
  onSelectLog,
  showToast,
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (showToast) {
      showToast(`Copied ${text.slice(0, 10)}... to clipboard!`);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Color generator for avatar based on email
  const getAvatarBg = (email) => {
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-purple-100 text-purple-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-700",
      "bg-indigo-100 text-indigo-700",
      "bg-teal-100 text-teal-700",
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
          Recent Audit Logs
        </h3>
        <button
          onClick={onViewAllLogs}
          className="text-xs md:text-sm font-semibold text-[#2563EB] hover:text-blue-800 hover:underline transition-colors"
        >
          View All Logs
        </button>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[620px] text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="py-3.5 pr-4 pl-1 font-medium">User</th>
              <th className="py-3.5 px-4 font-medium">FIU</th>
              <th className="py-3.5 px-4 font-medium">Action</th>
              <th className="py-3.5 px-4 font-medium">Timestamp</th>
              <th className="py-3.5 pl-4 pr-1 font-medium">Tx Hash</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 text-[13px]">
            {logs.slice(0, 5).map((log) => {
              const isGranted = log.action.includes("GRANTED") || log.action.includes("APPROVED");
              return (
                <tr
                  key={log.id}
                  onClick={() => onSelectLog && onSelectLog(log)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* User */}
                  <td className="py-3.5 pr-4 pl-1">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${getAvatarBg(
                          log.user
                        )}`}
                      >
                        {log.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 truncate max-w-[160px] md:max-w-[200px]">
                        {log.user}
                      </span>
                    </div>
                  </td>

                  {/* FIU */}
                  <td className="py-3.5 px-4 text-slate-600 font-normal">
                    {log.fiu}
                  </td>

                  {/* Action Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
                        isGranted
                          ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                          : "bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  {/* Tx Hash with Copy */}
                  <td className="py-3.5 pl-4 pr-1 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#2563EB] hover:underline">
                        {log.truncatedTx || "0x7fa....3b1c"}
                      </span>
                      <button
                        onClick={(e) => handleCopy(e, log.txHash, log.id)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                        title="Copy Transaction Hash"
                      >
                        {copiedId === log.id ? (
                          <FaCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <FaRegCopy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
