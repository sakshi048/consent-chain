import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUniversity,
  FaHome,
  FaFileAlt,
  FaLock,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaPaperPlane
} from "react-icons/fa";

const sampleCustomers = [
  { name: "Sakshi Gharat", pan: "BXYPS5678E", mobile: "9876543211", accounts: ["Bank A ••••1234 (SBI)", "Bank B ••••5678 (ICICI)"] },
  { name: "Ramlal Patil", pan: "ABCPL1234D", mobile: "9876543210", accounts: ["HDFC Bank ••••4567", "SBI ••••8877", "Axis Bank ••••9900"] },
  { name: "Rahul Mehta", pan: "RHLMT9988K", mobile: "9876543299", accounts: ["ICICI Bank ••••3344"] },
  { name: "Anita Sharma", pan: "ANTSH4455P", mobile: "9876543212", accounts: ["HDFC Bank ••••6677", "Kotak Bank ••••1122", "Punjab National Bank ••••3311", "SBI ••••4455"] }
];

const FiuCreateRequest = () => {
  const navigate = useNavigate();

  // Search & Selection State (Empty by default)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Purpose State (Empty by default)
  const [purpose, setPurpose] = useState("");

  // Dynamic Account Checkboxes State ({ "Bank A...": false, ... })
  const [checkedAccounts, setCheckedAccounts] = useState({});

  // Data Required State (Unchecked by default)
  const [dataRequired, setDataRequired] = useState({
    accountInfo: false,
    accountBalance: false,
    transactions: false,
    loanHistory: false
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setShowSearchResults(true);
    const match = sampleCustomers.find((c) => c.name.toLowerCase() === val.trim().toLowerCase());
    if (match) {
      setSelectedCustomer(match);
      setCheckedAccounts({});
    } else {
      setSelectedCustomer(null);
      setCheckedAccounts({});
    }
  };

  const handleCustomerSelect = (cust) => {
    setSelectedCustomer(cust);
    setSearchTerm(cust.name);
    setShowSearchResults(false);
    setCheckedAccounts({});
  };

  const handleAccountToggle = (accName) => {
    setCheckedAccounts((prev) => ({
      ...prev,
      [accName]: !prev[accName]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Build data scope string from checkboxes
    const scopes = [];
    if (dataRequired.accountInfo) scopes.push("Account Information");
    if (dataRequired.accountBalance) scopes.push("Account Balance");
    if (dataRequired.transactions) scopes.push("Transactions");
    if (dataRequired.loanHistory) scopes.push("Loan History");
    const dataScopeStr = scopes.length > 0 ? scopes.join(", ") : "Account Information";

    const customerName = selectedCustomer ? selectedCustomer.name : (searchTerm || "Sakshi Gharat");
    const customerPan = selectedCustomer ? selectedCustomer.pan : "BXYPS5678E";
    const selectedPurpose = purpose || "Loan Application";

    const payload = {
      customerPan: customerPan,
      purpose: selectedPurpose,
      dataScope: dataScopeStr,
      fromDate: "2026-01-01",
      toDate: "2026-09-30"
    };

    let backendRequestId = null;

    try {
      const response = await fetch("http://localhost:8081/fiu/data-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        backendRequestId = data.requestId;
      }
    } catch (err) {
      console.warn("Backend creation error, saving locally:", err);
    }

    const newReq = {
      id: backendRequestId || ("REQ-" + Math.floor(1000 + Math.random() * 9000)),
      customer: customerName,
      purpose: selectedPurpose,
      status: "Pending Consent",
      date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save to localStorage requests list
    const existing = JSON.parse(localStorage.getItem("fiuRequests") || "[]");
    localStorage.setItem("fiuRequests", JSON.stringify([newReq, ...existing]));

    setLoading(false);
    setSuccessMsg("Consent Request sent to AA successfully!");
    setTimeout(() => {
      navigate("/fiu/requests");
    }, 1000);
  };

  const filteredCustomers = sampleCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm)
  );

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

          {/* Active Item */}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] bg-white/20 text-white font-medium shadow-sm text-left">
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

      {/* MAIN CONTENT AREA - CENTERED */}
      <main className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-start">
        <div className="w-full max-w-[560px]">
          {/* Title Header */}
          <div className="mb-6">
            <h2 className="text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
              Create Data Request
            </h2>
          </div>

          {/* CREATE DATA REQUEST FORM CARD */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 w-full">
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <span>✓</span> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Customer Search */}
              <div className="relative">
                <label className="block text-[13px] font-bold text-slate-800 mb-1.5">
                  Customer
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    placeholder="Search by name, PAN or mobile"
                    className="w-full h-[46px] pl-4 pr-10 bg-white border border-gray-200 rounded-xl text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all"
                    required
                  />
                  <FaSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[14px]" />
                </div>

                {/* Customer Search Dropdown */}
                {showSearchResults && searchTerm && filteredCustomers.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[180px] overflow-y-auto divide-y divide-gray-100">
                    {filteredCustomers.map((cust) => (
                      <div
                        key={cust.name}
                        onClick={() => handleCustomerSelect(cust)}
                        className="p-3 hover:bg-purple-50/60 cursor-pointer text-xs transition-colors"
                      >
                        <div className="font-bold text-slate-800">{cust.name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          PAN: {cust.pan} • Mobile: {cust.mobile}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Purpose */}
              <div>
                <label className="block text-[13px] font-bold text-slate-800 mb-1.5">
                  Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full h-[46px] px-4 bg-white border border-gray-200 rounded-xl text-[13px] text-slate-800 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all cursor-pointer font-medium"
                  required
                >
                  <option value="" disabled hidden>
                    Select Purpose
                  </option>
                  <option value="Loan Application">Loan Application</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Credit Verification">Credit Verification</option>
                  <option value="Wealth Management">Wealth Management</option>
                </select>
              </div>

              {/* 3. Select Accounts (Only visible when customer is selected) */}
              {selectedCustomer && selectedCustomer.accounts && selectedCustomer.accounts.length > 0 && (
                <div>
                  <label className="block text-[13px] font-bold text-slate-800 mb-2">
                    Select Accounts ({selectedCustomer.name})
                  </label>
                  <div className="space-y-2 text-[13px] text-slate-700">
                    {selectedCustomer.accounts.map((acc, index) => (
                      <label key={index} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedAccounts[acc]}
                          onChange={() => handleAccountToggle(acc)}
                          className="w-4 h-4 accent-purple-700 rounded cursor-pointer"
                        />
                        <span>{acc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Data Required */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-[13px] font-bold text-slate-800 mb-2">
                  Data Required
                </label>
                <div className="space-y-2.5 text-[13px] text-slate-700">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataRequired.accountInfo}
                      onChange={(e) =>
                        setDataRequired({ ...dataRequired, accountInfo: e.target.checked })
                      }
                      className="w-4 h-4 accent-purple-700 rounded cursor-pointer"
                    />
                    <span>Account Information</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataRequired.accountBalance}
                      onChange={(e) =>
                        setDataRequired({ ...dataRequired, accountBalance: e.target.checked })
                      }
                      className="w-4 h-4 accent-purple-700 rounded cursor-pointer"
                    />
                    <span>Account Balance</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataRequired.transactions}
                      onChange={(e) =>
                        setDataRequired({ ...dataRequired, transactions: e.target.checked })
                      }
                      className="w-4 h-4 accent-purple-700 rounded cursor-pointer"
                    />
                    <span>Transactions</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataRequired.loanHistory}
                      onChange={(e) =>
                        setDataRequired({ ...dataRequired, loanHistory: e.target.checked })
                      }
                      className="w-4 h-4 accent-purple-700 rounded cursor-pointer"
                    />
                    <span>Loan History (if any)</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] mt-3 flex items-center justify-center gap-2.5 bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-[14px] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <FaPaperPlane className="text-[14px]" />
                <span>{loading ? "Sending Request..." : "Provide Consent Request to AA"}</span>
              </button>
            </form>

            {/* Notice Box */}
            <div className="mt-5 p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl text-center">
              <p className="text-[12px] text-purple-900 font-medium leading-relaxed">
                After sending, the request will be sent to AA and then to the customer for consent.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FiuCreateRequest;
