import React from "react";
import { FaExternalLinkAlt, FaCheck } from "react-icons/fa";

export default function BlockchainSyncCard({ blockchainStatus, onOpenExplorer }) {
  // Format seconds into human readable time
  const formatTimeAgo = (seconds) => {
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    return `${mins} mins ago`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Blockchain Sync Status
        </h3>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Synced</span>
        </div>
      </div>

      {/* Visual Block Pipeline (4 Isometric Blocks) */}
      <div className="py-4 my-2 flex items-center justify-center">
        <div className="w-full max-w-[280px]">
          <svg
            viewBox="0 0 280 60"
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Dashed connector line */}
            <line
              x1="35"
              y1="30"
              x2="245"
              y2="30"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="4,4"
              className="opacity-70"
            />

            {/* Block 1 (Isometric Wireframe Green) */}
            <g transform="translate(18, 12)">
              <polygon
                points="16,0 32,8 16,16 0,8"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
              />
              <polygon
                points="0,8 16,16 16,32 0,24"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
              />
              <polygon
                points="16,16 32,8 32,24 16,32"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
              />
            </g>

            {/* Block 2 (Isometric Wireframe Green) */}
            <g transform="translate(88, 12)">
              <polygon
                points="16,0 32,8 16,16 0,8"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
              />
              <polygon
                points="0,8 16,16 16,32 0,24"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
              />
              <polygon
                points="16,16 32,8 32,24 16,32"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
              />
            </g>

            {/* Block 3 (Isometric Wireframe Green) */}
            <g transform="translate(158, 12)">
              <polygon
                points="16,0 32,8 16,16 0,8"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
              />
              <polygon
                points="0,8 16,16 16,32 0,24"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
              />
              <polygon
                points="16,16 32,8 32,24 16,32"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
              />
            </g>

            {/* Block 4 (Verified Solid Check Green) */}
            <g transform="translate(228, 12)">
              <circle
                cx="16"
                cy="16"
                r="16"
                fill="#10B981"
                className="shadow-sm"
              />
              <path
                d="M11 16.5l3.5 3.5 7-7"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Last Block Confirmed */}
      <div className="mb-4">
        <span className="text-xs text-slate-500 font-medium block">
          Last Block Confirmed
        </span>
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5 block">
          {formatTimeAgo(blockchainStatus.lastConfirmedSeconds || 120)}
        </span>
      </div>

      {/* Details List */}
      <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Network</span>
          <span className="font-semibold text-slate-800">
            {blockchainStatus.network || "Polygon Testnet"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Latest Block</span>
          <span className="font-mono font-semibold text-slate-800">
            {blockchainStatus.formattedBlock || "#8,945,672"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Node Status</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
            {blockchainStatus.nodeStatus || "Healthy"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Peers Connected</span>
          <span className="font-semibold text-slate-800">
            {blockchainStatus.peersConnected || 12}
          </span>
        </div>
      </div>

      {/* Explorer Button */}
      <button
        onClick={onOpenExplorer}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 transition-all hover:border-slate-300 shadow-sm"
      >
        <span>View Blockchain Explorer</span>
        <FaExternalLinkAlt className="w-3 h-3 text-slate-400" />
      </button>
    </div>
  );
}
