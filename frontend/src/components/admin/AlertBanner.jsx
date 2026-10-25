import React from "react";
import { FaExclamationCircle, FaChevronRight } from "react-icons/fa";

export default function AlertBanner({ onViewAlerts }) {
  return (
    <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shadow-sm hover:shadow transition-shadow">
      {/* Left Icon and Text */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm flex-shrink-0">
          <FaExclamationCircle className="w-5 h-5 text-[#E11D48]" />
        </div>

        <div>
          <h4 className="text-sm md:text-[15px] font-bold text-[#9F1239] leading-snug">
            Suspicious Activity Detected
          </h4>
          <p className="text-xs md:text-[13px] text-slate-600 mt-0.5 font-normal">
            Multiple consent grants detected from unusual locations.
          </p>
        </div>
      </div>

      {/* Right Button */}
      <div className="flex-shrink-0 self-end sm:self-auto">
        <button
          onClick={onViewAlerts}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-rose-50 text-[#E11D48] text-xs font-semibold rounded-xl border border-rose-200 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
        >
          <span>View Alerts</span>
          <FaChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
