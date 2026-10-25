import React, { useState, useRef, useEffect } from "react";
import {
  FaBars,
  FaBell,
  FaShieldAlt,
  FaSyncAlt,
  FaCheck,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaExchangeAlt,
  FaBolt,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminHeader({
  title = "Admin Dashboard",
  sidebarOpen,
  setSidebarOpen,
  isLiveUpdating,
  setIsLiveUpdating,
  onRefresh,
  isRefreshing,
  onSimulateEvent,
  notifications = [],
  onClearNotifications,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 md:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Toggle & Title */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <FaBars className="w-5 h-5" />
          </button>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
            {title}
          </h2>
        </div>

        {/* Right Side: Actions, Notifications, Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Quick Simulation / Real-World Trigger Button (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onSimulateEvent}
              title="Inject a real-world consent or revocation event to see live updates"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all active:scale-95 shadow-sm"
            >
              <FaBolt className="w-3 h-3 text-amber-500" />
              <span>Simulate Event</span>
            </button>

            {/* Live Updates Toggle */}
            <button
              onClick={() => setIsLiveUpdating(!isLiveUpdating)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isLiveUpdating
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
              title="Toggle automatic live polling of real-world backend and RPC"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveUpdating
                    ? "bg-emerald-500 animate-ping"
                    : "bg-slate-400"
                }`}
              />
              <span className="hidden md:inline">
                {isLiveUpdating ? "Live Sync ON" : "Live Sync OFF"}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh All Data"
            >
              <FaSyncAlt
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
              />
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 py-3 z-50 animate-fadeIn">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">
                      Notifications
                    </span>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div
                        key={idx}
                        className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                            notif.type === "alert"
                              ? "bg-rose-100 text-rose-600"
                              : notif.type === "blockchain"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {notif.type === "alert" ? (
                            <FaExclamationCircle />
                          ) : (
                            <FaCheck />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.time || "Just now"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 md:py-1.5 md:px-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                <FaShieldAlt className="w-4 h-4" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  Admin
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-none">
                  Super Administrator
                </p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">
                    ConsentChain Master Admin
                  </p>
                  <p className="text-[11px] text-slate-500">
                    admin@consentchain.io
                  </p>
                </div>

                <div className="py-1 text-xs text-slate-700">
                  <button
                    onClick={() => {
                      navigate("/fip/dashboard");
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-left"
                  >
                    <FaExchangeAlt className="w-3.5 h-3.5 text-slate-400" />
                    <span>Switch to FIP Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/fiu/dashboard");
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-left"
                  >
                    <FaExternalLinkAlt className="w-3.5 h-3.5 text-slate-400" />
                    <span>Switch to FIU Portal</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium"
                  >
                    <FaSignOutAlt className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
