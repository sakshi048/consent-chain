import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUniversity,
  FaTachometerAlt,
  FaCreditCard,
  FaShieldAlt,
  FaHistory,
  FaUser,
  FaSignOutAlt,
  FaCheckCircle,
  FaPlus,
  FaExchangeAlt
} from "react-icons/fa";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse stored profile:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    navigate("/login");
  };

  const name = userProfile?.name || "Ramlal Patil";
  const email = userProfile?.email || "ramlal.patil@example.com";
  const mobileNo = userProfile?.mobileNo || "9876543210";
  const bank = userProfile?.linkedBank || {
    bankName: "HDFC Bank",
    accountNumber: "AC1000234567",
    ifscCode: "HDFC0001234",
    accountHolderName: "Ramlal Patil",
    accountType: "Savings",
    state: "Maharashtra",
    city: "Mumbai"
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[230px] min-h-screen bg-gradient-to-b from-green-800 via-emerald-800 to-green-900 text-white flex flex-col flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="w-9 h-9 flex items-center justify-center text-white text-[22px] bg-white/15 rounded-xl">
            <FaUniversity />
          </div>
          <div>
            <h1 className="text-[15px] font-bold leading-tight tracking-wide">ConsentChain</h1>
            <p className="text-[11px] text-emerald-200 mt-0.5 font-medium">Customer Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] bg-white/15 text-white font-semibold shadow-sm text-left">
            <FaTachometerAlt />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-white/80 hover:bg-white/10 hover:text-white transition-all text-left">
            <FaCreditCard />
            <span>Linked Accounts</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-white/80 hover:bg-white/10 hover:text-white transition-all text-left">
            <FaShieldAlt />
            <span>Consents</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-white/80 hover:bg-white/10 hover:text-white transition-all text-left">
            <FaHistory />
            <span>Audit Trail</span>
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mx-3 mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[25px] font-bold text-slate-800 tracking-tight">Customer Dashboard</h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage your linked bank accounts, consents, and data sharing approvals.
            </p>
          </div>

          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <FaPlus /> <span>Link Another Bank</span>
          </button>
        </div>

        {/* Customer Profile & Linked Account Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Profile Details */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-lg font-bold">
                  <FaUser />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{name}</h3>
                  <p className="text-xs text-slate-500">{email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                <FaCheckCircle /> Active
              </span>
            </div>

            <div className="text-xs text-slate-700 space-y-2 pt-1">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-slate-400 font-medium">Mobile Number:</span>
                <span className="font-semibold text-slate-800">{mobileNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-slate-400 font-medium">State / City:</span>
                <span className="font-semibold text-slate-800">{bank.city || "Mumbai"}, {bank.state || "Maharashtra"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Account Status:</span>
                <span className="font-semibold text-green-700">Verified via AA</span>
              </div>
            </div>
          </div>

          {/* Linked Bank Account */}
          <div className="bg-gradient-to-br from-emerald-900 to-green-950 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-white text-9xl pointer-events-none">
              <FaUniversity />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {bank.bankName}
                </span>
                <span className="px-2 py-0.5 bg-white/15 text-[10px] font-bold rounded text-white">
                  {bank.accountType || "Savings"}
                </span>
              </div>

              <p className="text-[11px] text-white/70">Account Number</p>
              <h3 className="text-xl font-mono font-bold tracking-widest mt-0.5 mb-3">
                {bank.accountNumber}
              </h3>
            </div>

            <div className="pt-3 border-t border-white/15 flex justify-between items-end text-xs">
              <div>
                <p className="text-[10px] text-white/70">Account Holder</p>
                <p className="font-semibold text-white">{bank.accountHolderName || name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/70">IFSC Code</p>
                <p className="font-mono font-semibold text-emerald-300">{bank.ifscCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Consent Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Active Consents</span>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">2</h4>
            <span className="text-[11px] text-green-700 font-semibold mt-1 inline-block">HDFC, SBI Linked</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Pending Requests</span>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">1</h4>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block">Requires Approval</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Data Shares (30 Days)</span>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">5</h4>
            <span className="text-[11px] text-purple-700 font-semibold mt-1 inline-block">Encrypted Transfers</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
