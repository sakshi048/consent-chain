import React from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaServer,
  FaDatabase,
  FaCubes,
  FaHdd,
  FaEnvelope,
} from "react-icons/fa";

export default function SystemHealthCard({ services = [], onOpenSystemStatus }) {
  // Service icons mapping
  const getIcon = (name) => {
    switch (name) {
      case "API Services":
        return FaServer;
      case "Database":
        return FaDatabase;
      case "Blockchain Node":
        return FaCubes;
      case "File Storage":
        return FaHdd;
      case "Email Service":
        return FaEnvelope;
      default:
        return FaServer;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          System Health
        </h3>
      </div>

      {/* Services List */}
      <div className="space-y-3.5 mb-5">
        {services.map((service, index) => {
          const Icon = getIcon(service.name);
          const isHealthy = service.status === "Healthy";
          return (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span>{service.name}</span>
              </div>

              <div>
                {isHealthy ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                    <FaCheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>Healthy</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                    <FaExclamationTriangle className="w-3 h-3 text-amber-500" />
                    <span>Degraded</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View System Status Button */}
      <button
        onClick={onOpenSystemStatus}
        className="w-full flex items-center justify-center py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 transition-all hover:border-slate-300 shadow-sm"
      >
        View System Status
      </button>
    </div>
  );
}
