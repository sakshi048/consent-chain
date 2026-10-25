import React from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaShieldAlt,
  FaUniversity,
  FaFileAlt,
  FaTimesCircle,
  FaBell,
  FaChartBar,
  FaCubes,
  FaCog,
  FaCode,
  FaHeadphones,
  FaChevronDown,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { id: "users", label: "Users", icon: FaUsers },
  { id: "consents", label: "Consents", icon: FaShieldAlt },
  { id: "fius", label: "FIUs", icon: FaUniversity },
  { id: "auditLogs", label: "Audit Logs", icon: FaFileAlt },
  { id: "revocations", label: "Revocations", icon: FaTimesCircle },
  { id: "alerts", label: "Alerts", icon: FaBell, badge: 3 },
  { id: "reports", label: "Reports", icon: FaChartBar },
  { id: "blockchain", label: "Blockchain Explorer", icon: FaCubes },
  { id: "settings", label: "System Settings", icon: FaCog },
  { id: "api", label: "API Management", icon: FaCode },
  { id: "support", label: "Support", icon: FaHeadphones },
];

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  alertCount = 3,
  onOpenProfile,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-64 bg-[#0B1536] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#1a2753] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Logo Section */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#1A264F]">
            <div className="flex items-center gap-3">
              {/* Hexagon Shield Brand Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>

              <div>
                <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                  ConsentChain
                </h1>
                <p className="text-[11px] font-medium text-slate-400 tracking-wide">
                  Admin Panel
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              aria-label="Close Sidebar"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? "text-white" : "text-slate-400"
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>

                {item.id === "alerts" && alertCount > 0 && (
                  <span className="bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile Pill */}
        <div className="p-3 border-t border-[#1A264F] flex-shrink-0">
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#101D47] hover:bg-[#15255a] border border-[#1E2D60] transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <FaShieldAlt className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white leading-tight">
                  Admin
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Super Administrator
                </p>
              </div>
            </div>
            <FaChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white flex-shrink-0 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
