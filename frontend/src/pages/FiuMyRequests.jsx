import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUniversity,
  FaHome,
  FaFileAlt,
  FaLock,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaFilter,
  FaChevronRight,
  FaChevronLeft
} from "react-icons/fa";

const initialRequests = [
  {
    id: "REQ-1001",
    customer: "Sakshi Gharat",
    purpose: "Loan Application",
    status: "Pending Consent",
    date: "08 May 2025"
  },
  {
    id: "REQ-1002",
    customer: "Rahul Mehta",
    purpose: "Loan Application",
    status: "Approved",
    date: "08 May 2025"
  },
  {
    id: "REQ-1004",
    customer: "Amit Patil",
    purpose: "Business Loan",
    status: "Expired",
    date: "07 May 2025"
  },
  {
    id: "REQ-1005",
    customer: "Priya S",
    purpose: "Insurance",
    status: "Approved",
    date: "06 May 2025"
  },
  {
    id: "REQ-1006",
    customer: "Vikram Deshmukh",
    purpose: "Credit Verification",
    status: "Rejected",
    date: "05 May 2025"
  }
];

const FiuMyRequests = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Pending"); // Pending, Approved, Rejected, Expired
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const localSaved = JSON.parse(localStorage.getItem("fiuRequests") || "[]");
      
      try {
        const response = await fetch("http://localhost:8081/fiu/data-requests");
        if (response.ok) {
          const dbData = await response.json();
          const formattedDbData = dbData.map((item) => ({
            id: item.requestId,
            customer: item.customerPan || "Sakshi Gharat",
            purpose: item.purpose || "Loan Application",
            status: item.status === "CONSENT_REQUIRED" ? "Pending Consent" : item.status,
            date: item.fromDate || "30 Sep 2026"
          }));

          const merged = [...localSaved, ...formattedDbData, ...initialRequests];
          // Remove duplicates based on ID
          const unique = Array.from(new Map(merged.map((r) => [r.id, r])).values());
          setRequests(unique);
        } else {
          setRequests([...localSaved, ...initialRequests]);
        }
      } catch (err) {
        console.warn("Backend fetch failed, using local/seed data:", err);
        setRequests([...localSaved, ...initialRequests]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    navigate("/login");
  };

  // Filter requests based on activeTab and searchTerm
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customer.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "Pending") {
      return matchesSearch && (req.status === "Pending Consent" || req.status === "Pending" || req.status === "CONSENT_REQUIRED");
    } else if (activeTab === "Approved") {
      return matchesSearch && (req.status === "Approved" || req.status === "Data Received");
    } else if (activeTab === "Rejected") {
      return matchesSearch && req.status === "Rejected";
    } else if (activeTab === "Expired") {
      return matchesSearch && req.status === "Expired";
    }
    return matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "Pending Consent" || r.status === "Pending" || r.status === "CONSENT_REQUIRED").length;
  const approvedCount = requests.filter((r) => r.status === "Approved" || r.status === "Data Received").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;
  const expiredCount = requests.filter((r) => r.status === "Expired").length;

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
          <button
            onClick={() => navigate("/fiu/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
          >
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

          {/* Active Item */}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] bg-white/20 text-white font-medium shadow-sm text-left">
            <FaFileAlt className="text-[15px]" />
            <span>My Requests</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer">
            <FaLock className="text-[15px]" />
            <span>Received Data</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer">
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

      {/* MAIN CONTENT AREA - CENTERED */}
      <main className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-start">
        <div className="w-full max-w-[640px]">
          {/* Title Header */}
          <div className="mb-6">
            <h2 className="text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
              My Requests
            </h2>
          </div>

          {/* MY REQUESTS CARD CONTAINER */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm w-full overflow-hidden">
            {/* Status Tabs Header */}
            <div className="flex border-b border-gray-200 text-[13px] font-semibold text-slate-600 bg-white px-2">
              <button
                onClick={() => setActiveTab("Pending")}
                className={`py-3.5 px-4 transition-all border-b-2 cursor-pointer ${
                  activeTab === "Pending"
                    ? "border-[#6b21a8] text-[#6b21a8] font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                Pending ({pendingCount})
              </button>

              <button
                onClick={() => setActiveTab("Approved")}
                className={`py-3.5 px-4 transition-all border-b-2 cursor-pointer ${
                  activeTab === "Approved"
                    ? "border-[#6b21a8] text-[#6b21a8] font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                Approved ({approvedCount})
              </button>

              <button
                onClick={() => setActiveTab("Rejected")}
                className={`py-3.5 px-4 transition-all border-b-2 cursor-pointer ${
                  activeTab === "Rejected"
                    ? "border-[#6b21a8] text-[#6b21a8] font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                Rejected ({rejectedCount})
              </button>

              <button
                onClick={() => setActiveTab("Expired")}
                className={`py-3.5 px-4 transition-all border-b-2 cursor-pointer ${
                  activeTab === "Expired"
                    ? "border-[#6b21a8] text-[#6b21a8] font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                Expired ({expiredCount})
              </button>
            </div>

            {/* Search & Filters Bar */}
            <div className="p-4 flex items-center gap-3 border-b border-gray-100">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Request ID or Customer"
                  className="w-full h-[40px] pl-4 pr-10 bg-white border border-gray-200 rounded-xl text-[12px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10"
                />
                <FaSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]" />
              </div>

              <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 text-[12px] font-semibold rounded-xl transition-all cursor-pointer">
                <FaFilter className="text-slate-500 text-[11px]" />
                <span>Filters</span>
              </button>
            </div>

            {/* Requests List Items */}
            <div className="p-4 space-y-3.5 divide-y divide-gray-100">
              {loading ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  Loading requests from database...
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  No requests found in this category.
                </div>
              ) : (
                filteredRequests.map((req, idx) => (
                  <div
                    key={req.id + idx}
                    className="pt-3.5 first:pt-0 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h3 className="text-[14px] font-bold text-blue-600">
                        {req.id}
                      </h3>

                      <div className="text-[12px] text-slate-600 space-y-0.5">
                        <p><span className="text-slate-400">Customer:</span> <span className="font-semibold text-slate-800">{req.customer}</span></p>
                        <p><span className="text-slate-400">Purpose:</span> {req.purpose}</p>
                        <p><span className="text-slate-400">Requested On:</span> {req.date}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2.5">
                      {/* Status Badge */}
                      {(req.status === "Pending Consent" || req.status === "Pending" || req.status === "CONSENT_REQUIRED") && (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold rounded-md">
                          Pending Consent
                        </span>
                      )}
                      {(req.status === "Approved" || req.status === "Data Received") && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded-md">
                          Approved
                        </span>
                      )}
                      {req.status === "Expired" && (
                        <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold rounded-md">
                          Expired
                        </span>
                      )}
                      {req.status === "Rejected" && (
                        <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold rounded-md">
                          Rejected
                        </span>
                      )}

                      {/* Action Button */}
                      {(req.status === "Approved" || req.status === "Data Received") ? (
                        <button className="px-3 py-1.5 bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 text-[12px] font-semibold rounded-lg shadow-sm flex items-center gap-1 transition-all cursor-pointer">
                          <span>View Data</span>
                          <FaChevronRight className="text-[10px]" />
                        </button>
                      ) : (
                        <button className="px-3.5 py-1.5 bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 text-[12px] font-semibold rounded-lg shadow-sm transition-all cursor-pointer">
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Footer */}
            <div className="px-5 py-3.5 bg-slate-50/70 border-t border-gray-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Showing 1 to {filteredRequests.length} of {filteredRequests.length} {activeTab.toLowerCase()} requests
              </span>

              <div className="flex items-center gap-1.5">
                <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-white text-slate-400">
                  <FaChevronLeft className="text-[10px]" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-[#6b21a8] text-white font-bold flex items-center justify-center shadow-sm">
                  1
                </button>
                <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-white text-slate-400">
                  <FaChevronRight className="text-[10px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FiuMyRequests;
