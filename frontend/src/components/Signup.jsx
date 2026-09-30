import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUniversity,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaPhone,
  FaBuilding,
  FaCheckCircle,
  FaArrowLeft,
  FaCreditCard
} from "react-icons/fa";
import { signupStyles } from "../assets/dummyStyles";

const STATE_CITY_MAP = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Delhi: ["New Delhi", "North Delhi", "South Delhi"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubballi"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara"]
};

const DEFAULT_BRANCHES = [
  { bankName: "HDFC Bank", ifscCode: "HDFC0001234", branchName: "Mumbai Main Branch" },
  { bankName: "State Bank of India (SBI)", ifscCode: "SBIN0004567", branchName: "Fort Branch, Mumbai" },
  { bankName: "ICICI Bank", ifscCode: "ICIC0007890", branchName: "BKC Branch, Mumbai" }
];

const Signup = () => {
  const navigate = useNavigate();

  // Step Tracker (1 to 4)
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Personal Details
  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    email: "",
    mobileNo: "",
    password: ""
  });

  // Step 2: Bank Details
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("Mumbai");
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [ifscCode, setIfscCode] = useState("HDFC0001234");
  const [accountNumber, setAccountNumber] = useState("");

  // Step 3: Account Verify Result
  const [accountInfo, setAccountInfo] = useState({
    accountHolderName: "",
    accountType: "Savings",
    maskedAccNo: ""
  });

  // Handle State change -> refresh City dropdown
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setState(newState);
    const availableCities = STATE_CITY_MAP[newState] || [];
    const newCity = availableCities[0] || "";
    setCity(newCity);
  };

  // Fetch branches when State or City changes
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(
          `http://localhost:8081/bank/branches?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBranches(data);
            setSelectedBank(data[0].bankName);
            setIfscCode(data[0].ifscCode);
          } else {
            setBranches(DEFAULT_BRANCHES);
            setSelectedBank(DEFAULT_BRANCHES[0].bankName);
            setIfscCode(DEFAULT_BRANCHES[0].ifscCode);
          }
        } else {
          setBranches(DEFAULT_BRANCHES);
        }
      } catch (err) {
        console.warn("Using fallback branches due to network:", err);
        setBranches(DEFAULT_BRANCHES);
      }
    };

    fetchBranches();
  }, [state, city]);

  // Handle Bank selection -> auto-fill IFSC code
  const handleBankChange = (e) => {
    const bankName = e.target.value;
    setSelectedBank(bankName);
    const branch = branches.find((b) => b.bankName === bankName);
    if (branch) {
      setIfscCode(branch.ifscCode);
    }
  };

  // Step 1 Submit handler -> Move to Step 2
  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!personalDetails.name || !personalDetails.email || !personalDetails.mobileNo || !personalDetails.password) {
      setErrorMsg("Please fill in all personal details.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

const SEED_ACCOUNTS = ["AC1000234567", "AC2000998877", "AC1000234568", "AC3000556644"];

  // Step 2 Continue handler -> Call account-lookup & Move to Step 3
  const handleStep2Continue = async (e) => {
    e.preventDefault();
    const cleanedAcc = accountNumber.trim().toUpperCase();

    if (!selectedBank || !cleanedAcc) {
      setErrorMsg("Please select a bank and enter account number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(
        `http://localhost:8081/bank/account-lookup?accNo=${encodeURIComponent(cleanedAcc)}&ifsc=${encodeURIComponent(ifscCode)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.verified === false) {
          setErrorMsg("Invalid Account Number! Please enter a valid account number.");
          setLoading(false);
          return;
        }
        setAccountInfo({
          accountHolderName: data.accountHolderName || personalDetails.name || "Account Holder",
          accountType: data.accountType || "Savings",
          maskedAccNo: data.maskedAccNo || `XXXX${cleanedAcc.slice(-4)}`
        });
        setStep(3);
      } else {
        if (!SEED_ACCOUNTS.includes(cleanedAcc)) {
          setErrorMsg("Invalid Account Number! Please enter a valid account number.");
          setLoading(false);
          return;
        }
        setAccountInfo({
          accountHolderName: personalDetails.name || "Account Holder",
          accountType: "Savings",
          maskedAccNo: `XXXX${cleanedAcc.slice(-4)}`
        });
        setStep(3);
      }
    } catch (err) {
      console.warn("Account lookup fallback check:", err);
      if (!SEED_ACCOUNTS.includes(cleanedAcc)) {
        setErrorMsg("Invalid Account Number! Please enter a valid account number.");
        setLoading(false);
        return;
      }
      setAccountInfo({
        accountHolderName: personalDetails.name || "Account Holder",
        accountType: "Savings",
        maskedAccNo: `XXXX${cleanedAcc.slice(-4)}`
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Step 3 Confirmation handlers
  const handleStep3ConfirmYes = () => {
    setStep(4);
  };

  const handleStep3ConfirmNo = () => {
    setStep(2);
  };

  // Step 4 Final Submit handler
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const payload = {
      personalDetails,
      bankDetails: {
        state,
        city,
        bankName: selectedBank,
        ifscCode,
        accountNumber,
        accountHolderName: accountInfo.accountHolderName,
        accountType: accountInfo.accountType
      }
    };

    try {
      const res = await fetch("http://localhost:8081/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      const profileToSave = data.user || {
        name: personalDetails.name,
        email: personalDetails.email,
        mobileNo: personalDetails.mobileNo,
        linkedBank: {
          bankName: selectedBank,
          ifscCode,
          accountNumber,
          accountHolderName: accountInfo.accountHolderName,
          accountType: accountInfo.accountType
        }
      };
      localStorage.setItem("userProfile", JSON.stringify(profileToSave));
      navigate("/customer/dashboard");
    } catch (err) {
      console.warn("Backend registration warning, using local session:", err);
      const fallbackProfile = {
        name: personalDetails.name,
        email: personalDetails.email,
        mobileNo: personalDetails.mobileNo,
        linkedBank: {
          bankName: selectedBank,
          ifscCode,
          accountNumber,
          accountHolderName: accountInfo.accountHolderName,
          accountType: accountInfo.accountType
        }
      };
      localStorage.setItem("userProfile", JSON.stringify(fallbackProfile));
      navigate("/customer/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={signupStyles.container}>
      <div className={`${signupStyles.card} max-w-[440px]`}>
        {/* Header */}
        <div className={signupStyles.header}>
          <div className={signupStyles.logoContainer}>
            <FaUniversity className={signupStyles.logoIcon} />
          </div>
          <h1 className={signupStyles.title}>ConsentChain AA</h1>
          <p className={signupStyles.subtitle}>Bank Account Add & Registration</p>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-white text-green-800 scale-110 shadow-md"
                    : step > s
                    ? "bg-emerald-400 text-green-900"
                    : "bg-white/20 text-white/70"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className={signupStyles.formContainer}>
          {errorMsg && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className={signupStyles.form}>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Step 1: Personal Details</h2>
              
              <div className={signupStyles.formGroup}>
                <label className={signupStyles.label}>Full Name</label>
                <div className={signupStyles.inputWrapper}>
                  <FaUser className={signupStyles.inputIcon} />
                  <input
                    type="text"
                    value={personalDetails.name}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, name: e.target.value })}
                    placeholder="Enter full name"
                    className={signupStyles.input}
                    required
                  />
                </div>
              </div>

              <div className={signupStyles.formGroup}>
                <label className={signupStyles.label}>Email Address</label>
                <div className={signupStyles.inputWrapper}>
                  <FaEnvelope className={signupStyles.inputIcon} />
                  <input
                    type="email"
                    value={personalDetails.email}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })}
                    placeholder="Enter email address"
                    className={signupStyles.input}
                    required
                  />
                </div>
              </div>

              <div className={signupStyles.formGroup}>
                <label className={signupStyles.label}>Mobile Number</label>
                <div className={signupStyles.inputWrapper}>
                  <FaPhone className={signupStyles.inputIcon} />
                  <input
                    type="tel"
                    value={personalDetails.mobileNo}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, mobileNo: e.target.value })}
                    placeholder="Enter mobile number"
                    className={signupStyles.input}
                    required
                  />
                </div>
              </div>

              <div className={signupStyles.formGroup}>
                <label className={signupStyles.label}>Password</label>
                <div className={signupStyles.inputWrapper}>
                  <FaLock className={signupStyles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={personalDetails.password}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, password: e.target.value })}
                    placeholder="Create a password"
                    className={signupStyles.input}
                    required
                  />
                  <button
                    type="button"
                    className={signupStyles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className={signupStyles.signupButton}>
                Next: Bank Details →
              </button>
            </form>
          )}

          {/* STEP 2: Bank Details */}
          {step === 2 && (
            <form onSubmit={handleStep2Continue} className={signupStyles.form}>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1"
                >
                  <FaArrowLeft /> Back
                </button>
                <h2 className="text-sm font-semibold text-slate-700">Step 2: Bank Details</h2>
              </div>

              {/* State Dropdown */}
              <div className={signupStyles.formGroup}>
                <label className={signupStyles.label}>State</label>
                <select
                  value={state}
                  onChange={handleStateChange}
                  className="w-full h-[46px] px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-slate-800 outline-none focus:border-green-700 font-medium"
                >
                  {Object.keys(STATE_CITY_MAP).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div className={signupStyles.formGroup}>
                <label className={signupStyles.label}>City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-[46px] px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-slate-800 outline-none focus:border-green-700 font-medium"
                >
                  {(STATE_CITY_MAP[state] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Bank Dropdown */}
              <div className={signupStyles.formGroup}>
                <label className={signupStyles.label}>Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={handleBankChange}
                  className="w-full h-[46px] px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-slate-800 outline-none focus:border-green-700 font-medium cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.bankName} value={b.bankName}>
                      {b.bankName} ({b.branchName})
                    </option>
                  ))}
                </select>
              </div>

              {/* IFSC Code Auto-filled */}
              <div className={signupStyles.formGroup}>
                <label className={signupStyles.label}>IFSC Code (Auto-filled)</label>
                <div className={signupStyles.inputWrapper}>
                  <FaBuilding className={signupStyles.inputIcon} />
                  <input
                    type="text"
                    value={ifscCode}
                    readOnly
                    className="w-full h-[46px] pl-10 bg-gray-100 border border-gray-200 rounded-xl text-[13px] text-slate-700 font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Account Number */}
              <div className={signupStyles.formGroup}>
                <label className={signupStyles.label}>Account Number</label>
                <div className={signupStyles.inputWrapper}>
                  <FaCreditCard className={signupStyles.inputIcon} />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. AC1000234567"
                    className={signupStyles.input}
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Valid seed accounts: AC1000234567, AC2000998877, AC1000234568, AC3000556644
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={signupStyles.signupButton}
              >
                {loading ? "Looking up Account..." : "Continue to Verify →"}
              </button>
            </form>
          )}

          {/* STEP 3: Account Verify */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-700">Step 3: Verify Account Details</h2>
              
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <FaCheckCircle /> Account Information Fetched
                </div>
                
                <div className="text-xs text-slate-700 space-y-1 mt-2">
                  <p><span className="font-semibold text-slate-900">Account Holder:</span> {accountInfo.accountHolderName}</p>
                  <p><span className="font-semibold text-slate-900">Type:</span> {accountInfo.accountType}</p>
                  <p><span className="font-semibold text-slate-900">Account No:</span> {accountInfo.maskedAccNo}</p>
                  <p><span className="font-semibold text-slate-900">Bank:</span> {selectedBank} ({ifscCode})</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-xs font-bold text-amber-900">Is this your account?</p>
                
                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleStep3ConfirmNo}
                    className="flex-1 py-2 bg-white border border-gray-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    No (Re-enter)
                  </button>
                  <button
                    type="button"
                    onClick={handleStep3ConfirmYes}
                    className="flex-1 py-2 bg-green-700 text-white font-semibold text-xs rounded-lg hover:bg-green-800 shadow-sm cursor-pointer"
                  >
                    Yes, Proceed →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Final Submit */}
          {step === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-700">Step 4: Final Confirmation</h2>
              
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2">
                <div className="font-bold text-slate-800 border-b pb-1">Personal Details</div>
                <p><span className="text-slate-500">Name:</span> {personalDetails.name}</p>
                <p><span className="text-slate-500">Email:</span> {personalDetails.email}</p>
                <p><span className="text-slate-500">Mobile:</span> {personalDetails.mobileNo}</p>

                <div className="font-bold text-slate-800 border-b pb-1 mt-3">Linked Bank Account</div>
                <p><span className="text-slate-500">Bank:</span> {selectedBank}</p>
                <p><span className="text-slate-500">Holder:</span> {accountInfo.accountHolderName}</p>
                <p><span className="text-slate-500">Account No:</span> {accountNumber}</p>
                <p><span className="text-slate-500">IFSC:</span> {ifscCode}</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-3 py-2.5 bg-gray-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-700 to-emerald-800 text-white text-xs font-semibold rounded-xl hover:from-green-800 hover:to-emerald-900 shadow-md cursor-pointer"
                >
                  {loading ? "Registering..." : "Confirm & Complete Registration ✓"}
                </button>
              </div>
            </form>
          )}

          <p className={signupStyles.loginText}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={signupStyles.loginLink}
            >
              Sign In
            </button>
          </p>

          <div className={signupStyles.infoBox}>
            <div className={signupStyles.infoIconContainer}>
              <FaInfoCircle className={signupStyles.infoIcon} />
            </div>
            <div className={signupStyles.infoContent}>
              <p className={signupStyles.infoText}>
                Account Aggregator consent-based signup flow.
              </p>
              <p className={signupStyles.infoTextSecondary}>
                Your financial data is fetched directly via encrypted APIs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;