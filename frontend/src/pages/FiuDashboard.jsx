import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUniversity,
  FaHome,
  FaFileAlt,
  FaLock,
  FaCog,
  FaSignOutAlt,
  FaPlus
} from "react-icons/fa";

const requestsData = [
  {
    id: "REQ-1001",
    customer: "Sakshi Gharat",
    purpose: "Loan Application",
    status: "Pending Consent",
    date: "08 May 2025",
    time: "10:15 AM"
  },
  {
    id: "REQ-1002",
    customer: "Rahul Mehta",
    purpose: "Loan Application",
    status: "Approved",
    date: "08 May 2025",
    time: "09:40 AM"
  },
  {
    id: "REQ-1003",
    customer: "Priya S",
    purpose: "Insurance",
    status: "Data Received",
    date: "08 May 2025",
    time: "09:20 AM"
  }
];

const FiuDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] font-sans antialiased">
      {/* LEFT PURPLE SIDEBAR */}
      <aside className="w-[240px] min-h-screen bg-[#6b21a8] text-white flex flex-col flex-shrink-0 shadow-lg">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-10 h-10 flex items-center justify-center text-white text-[24px]">
            <FaUniversity />
          </div>
          <div>
            <h1 className="text-[17px] font-bold tracking-tight leading-tight uppercase">
              HDFC BANK
            </h1>
            <p className="text-[12px] text-white/80 font-normal">
              FIU Portal
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* Active Item */}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] bg-white/20 text-white font-medium shadow-sm text-left">
            <FaHome className="text-[16px]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/fiu/requests/create")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
          >
            <FaFileAlt className="text-[15px]" />
            <span>Create Request</span>
          </button>

          <button
            onClick={() => navigate("/fiu/requests")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
          >
            <FaFileAlt className="text-[15px]" />
            <span>My Requests</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer">
            <FaLock className="text-[15px]" />
            <span>Received Data</span>
          </button>

          <button
            onClick={() => navigate("/fiu/requests")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
          >
            <FaFileAlt className="text-[15px]" />
            <span>Request History</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer">
            <FaCog className="text-[15px]" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mx-4 mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-left"
        >
          <FaSignOutAlt className="text-[16px]" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Title Header */}
        <div className="mb-6">
          <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">
            FIU Dashboard
          </h2>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Overview of your data request activity
          </p>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* Card 1: Pending Consent */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between h-[130px]">
            <span className="text-[13px] font-medium text-slate-700">
              Pending Consent
            </span>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none">
              3
            </h3>
            <button
              onClick={() => navigate("/fiu/requests")}
              className="text-[12px] font-semibold text-purple-700 hover:text-purple-900 text-left transition-colors cursor-pointer"
            >
              View all
            </button>
          </div>

          {/* Card 2: Approved */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between h-[130px]">
            <span className="text-[13px] font-medium text-slate-700">
              Approved
            </span>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none">
              8
            </h3>
            <button
              onClick={() => navigate("/fiu/requests")}
              className="text-[12px] font-semibold text-purple-700 hover:text-purple-900 text-left transition-colors cursor-pointer"
            >
              View all
            </button>
          </div>

          {/* Card 3: Rejected */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between h-[130px]">
            <span className="text-[13px] font-medium text-slate-700">
              Rejected
            </span>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none">
              2
            </h3>
            <button
              onClick={() => navigate("/fiu/requests")}
              className="text-[12px] font-semibold text-purple-700 hover:text-purple-900 text-left transition-colors cursor-pointer"
            >
              View all
            </button>
          </div>

          {/* Card 4: Data Received */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between h-[130px]">
            <span className="text-[13px] font-medium text-slate-700">
              Data Received
            </span>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none">
              6
            </h3>
            <button
              onClick={() => navigate("/fiu/requests")}
              className="text-[12px] font-semibold text-purple-700 hover:text-purple-900 text-left transition-colors cursor-pointer"
            >
              View all
            </button>
          </div>
        </div>

        {/* Action Button: Create Data Request */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/fiu/requests/create")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-[13px] font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <FaPlus className="text-[12px]" />
            <span>Create Data Request</span>
          </button>
        </div>

        {/* Recent Requests Section */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-slate-900">
              Recent Requests
            </h3>
            <button
              onClick={() => navigate("/fiu/requests")}
              className="text-[13px] font-semibold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* Requests Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-gray-100 text-[12px] font-semibold text-slate-600">
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Purpose</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Updated On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px] text-slate-700">
                {requestsData.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-blue-600">
                      {req.id}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {req.customer}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {req.purpose}
                    </td>
                    <td className="py-4 px-6">
                      {req.status === "Pending Consent" && (
                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] font-semibold rounded-md">
                          Pending Consent
                        </span>
                      )}
                      {req.status === "Approved" && (
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold rounded-md">
                          Approved
                        </span>
                      )}
                      {req.status === "Data Received" && (
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold rounded-md">
                          Data Received
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[12px] text-slate-500 font-normal">
                      <div>{req.date}</div>
                      <div className="text-[11px] text-slate-400">{req.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FiuDashboard;