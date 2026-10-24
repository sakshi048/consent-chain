import React, { useState } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCubes,
  FaShieldAlt,
  FaRegCopy,
  FaCheck,
  FaBolt,
  FaLock,
  FaServer,
} from "react-icons/fa";

export function BlockchainExplorerModal({
  isOpen,
  onClose,
  blockchainStatus,
  showToast,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (showToast) showToast("Contract address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleBlocks = [
    {
      number: blockchainStatus.latestBlock || 8945672,
      hash: "0x89fa432bca190ef920bce457631da290fe3b2a19",
      txCount: 42,
      time: "Just now",
      gasUsed: "1,842,910 (61%)",
    },
    {
      number: (blockchainStatus.latestBlock || 8945672) - 1,
      hash: "0x77ae2298bc01fa498230bcd7719aa0182ecbf810",
      txCount: 38,
      time: "12s ago",
      gasUsed: "1,520,300 (50%)",
    },
    {
      number: (blockchainStatus.latestBlock || 8945672) - 2,
      hash: "0x6198fbc1029daef00192bc98371190bcdae71923",
      txCount: 51,
      time: "24s ago",
      gasUsed: "2,190,440 (73%)",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FaCubes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Blockchain Explorer
              </h3>
              <p className="text-xs text-slate-500">
                Network: {blockchainStatus.network || "Polygon Testnet"} (ChainID: 80002)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Contract & Node Info */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">
              Consent Registry Smart Contract:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-purple-700 font-semibold truncate max-w-[260px]">
                {blockchainStatus.contractAddress}
              </span>
              <button
                onClick={() => handleCopy(blockchainStatus.contractAddress)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                {copied ? (
                  <FaCheck className="text-emerald-600 w-3.5 h-3.5" />
                ) : (
                  <FaRegCopy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Node Status</span>
              <span className="font-semibold text-emerald-600">● Online / Verified</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Gas Price</span>
              <span className="font-semibold text-slate-800">
                {blockchainStatus.gasPriceGwei || "32.4"} Gwei
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">TPS</span>
              <span className="font-semibold text-slate-800">
                {blockchainStatus.tps || "48.2"} tx/s
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Peers</span>
              <span className="font-semibold text-slate-800">
                {blockchainStatus.peersConnected || 12} Nodes
              </span>
            </div>
          </div>
        </div>

        {/* Recent Blocks Table */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Recently Mined Blocks
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {sampleBlocks.map((blk) => (
              <div
                key={blk.number}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">
                      #{blk.number.toLocaleString()}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {blk.txCount} txns
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 truncate block max-w-[200px] sm:max-w-[320px] mt-0.5">
                    {blk.hash}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-slate-600 block">{blk.time}</span>
                  <span className="text-[10px] text-slate-400">Gas: {blk.gasUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
}

export function SystemStatusModal({ isOpen, onClose, services = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FaServer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                System Infrastructure Status
              </h3>
              <p className="text-xs text-slate-500">
                Real-time operational monitoring & health metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Health Card */}
        <div className="my-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <FaExclamationTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h5 className="font-bold text-amber-900">
              Minor Service Degradation: Email Gateway
            </h5>
            <p className="text-amber-800/90 mt-0.5 leading-relaxed">
              Core consensus, blockchain node, and API gateways are functioning normally at 99.98% uptime. Outbound notification SMTP queue is recovering.
            </p>
          </div>
        </div>

        {/* Detailed Services Breakdown */}
        <div className="space-y-3 mb-5">
          {services.map((srv, idx) => {
            const isHealthy = srv.status === "Healthy";
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-800 block">
                    {srv.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Latency: {srv.latency || "24ms"} | Uptime: {srv.uptime || "99.9%"}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isHealthy
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isHealthy ? (
                      <FaCheckCircle className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <FaExclamationTriangle className="w-3 h-3 text-amber-600" />
                    )}
                    <span>{srv.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertsModal({
  isOpen,
  onClose,
  alerts = [],
  onResolveAlert,
  showToast,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <FaShieldAlt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Active Security Alerts
              </h3>
              <p className="text-xs text-slate-500">
                Automated threat detection and compliance notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3.5 my-5">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active security alerts. System is protected.
            </div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/70 transition-colors text-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-950">
                      {alt.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        alt.severity === "Critical"
                          ? "bg-rose-200 text-rose-800"
                          : "bg-amber-200 text-amber-800"
                      }`}
                    >
                      {alt.severity}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {alt.timestamp}
                  </span>
                </div>

                <p className="text-slate-600 text-xs mb-3">
                  {alt.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-rose-100/80">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {alt.id} | Source: {alt.source}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (showToast) showToast(`Blocked IP for alert ${alt.id}`);
                        if (onResolveAlert) onResolveAlert(alt.id);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      Block IP
                    </button>
                    <button
                      onClick={() => {
                        if (showToast) showToast(`Resolved alert ${alt.id}`);
                        if (onResolveAlert) onResolveAlert(alt.id);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuditDetailModal({ isOpen, onClose, log, showToast }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !log) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (showToast) showToast("Copied hash to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Audit Log Receipt
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-400">Action:</span>
            <span className="font-bold text-slate-800">{log.action}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-400">User:</span>
            <span className="font-semibold text-slate-800">{log.user}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-400">FIU Organization:</span>
            <span className="font-semibold text-slate-800">{log.fiu}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-400">Timestamp:</span>
            <span className="text-slate-600">{log.timestamp}</span>
          </div>

          <div className="py-2">
            <span className="text-slate-400 block mb-1">
              Cryptographic Transaction Hash:
            </span>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] break-all flex items-center justify-between gap-2 text-blue-700">
              <span>{log.txHash}</span>
              <button
                onClick={() => handleCopy(log.txHash)}
                className="text-slate-400 hover:text-slate-700 flex-shrink-0"
              >
                {copied ? <FaCheck className="text-emerald-600" /> : <FaRegCopy />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
