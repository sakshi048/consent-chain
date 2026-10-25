import React from "react";
import {
  FaUsers,
  FaShieldAlt,
  FaUniversity,
  FaTimesCircle,
} from "react-icons/fa";

export default function AdminMetrics({ metrics, onCardClick }) {
  const cards = [
    {
      id: "users",
      title: "Total Users",
      value: metrics.totalUsers?.toLocaleString() || "1,204",
      trend: metrics.usersTrend || "↑ 12.5%",
      period: metrics.usersPeriod || "vs last 30 days",
      icon: FaUsers,
      iconBg: "bg-blue-50 text-blue-600",
      targetTab: "users",
    },
    {
      id: "consents",
      title: "Active Consents",
      value: metrics.activeConsents?.toLocaleString() || "876",
      trend: metrics.consentsTrend || "↑ 8.4%",
      period: metrics.consentsPeriod || "vs last 30 days",
      icon: FaShieldAlt,
      iconBg: "bg-[#E6F9F5] text-[#0D9488]",
      targetTab: "consents",
    },
    {
      id: "fius",
      title: "Registered FIUs",
      value: metrics.registeredFius?.toLocaleString() || "12",
      trend: metrics.fiusTrend || "↑ 9.1%",
      period: metrics.fiusPeriod || "vs last 30 days",
      icon: FaUniversity,
      iconBg: "bg-purple-50 text-purple-600",
      targetTab: "fius",
    },
    {
      id: "revocations",
      title: "Revocations Today",
      value: metrics.revocationsToday?.toLocaleString() || "34",
      trend: metrics.revocationsTrend || "↑ 21.2%",
      period: metrics.revocationsPeriod || "vs yesterday",
      icon: FaTimesCircle,
      iconBg: "bg-rose-50 text-rose-500",
      targetTab: "revocations",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick && onCardClick(card.targetTab)}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-4 group"
          >
            {/* Left Icon Container */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${card.iconBg}`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Right Content */}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-slate-500 block truncate">
                {card.title}
              </span>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                  {card.value}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center whitespace-nowrap">
                  {card.trend}
                </span>
              </div>

              <span className="text-[11px] text-slate-400 mt-1 block truncate font-normal">
                {card.period}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
