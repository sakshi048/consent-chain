import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUniversity,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaLock,
  FaUser,
  FaUserCircle,
  FaBuilding,
  FaShieldAlt
} from "react-icons/fa";
import { loginStyles } from "../assets/dummyStyles.js";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [portalType, setPortalType] = useState("CUSTOMER"); // CUSTOMER, FIU, FIP

  const [formData, setFormData] = useState({
    institutionId: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (portalType === "CUSTOMER") {
      navigate("/customer/dashboard");
    } else if (portalType === "FIU") {
      navigate("/fiu/dashboard");
    } else {
      navigate("/fip/dashboard");
    }
  };

  return (
    <div className={loginStyles.container}>
      <div className={loginStyles.card}>
        {/* Header */}
        <div className={loginStyles.header}>
          <div className={loginStyles.logoContainer}>
            <FaUniversity className={loginStyles.logoIcon} />
          </div>

          <h1 className={loginStyles.title}>ConsentChain</h1>

          <p className={loginStyles.subtitle}>
            {portalType === "CUSTOMER" ? "Customer Portal" : portalType === "FIU" ? "FIU Portal" : "FIP Portal"}
          </p>

          {/* Portal Selector Tabs */}
          <div className="flex bg-white/15 p-1 rounded-xl mt-3 text-xs">
            <button
              type="button"
              onClick={() => setPortalType("CUSTOMER")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                portalType === "CUSTOMER" ? "bg-white text-purple-900 shadow" : "text-white/80 hover:text-white"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setPortalType("FIU")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                portalType === "FIU" ? "bg-white text-purple-900 shadow" : "text-white/80 hover:text-white"
              }`}
            >
              FIU
            </button>
            <button
              type="button"
              onClick={() => setPortalType("FIP")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                portalType === "FIP" ? "bg-white text-purple-900 shadow" : "text-white/80 hover:text-white"
              }`}
            >
              FIP
            </button>
          </div>
        </div>

        {/* Form */}
        <div className={loginStyles.formContainer}>
          <form onSubmit={handleSubmit} className={loginStyles.form}>
            {/* Username / ID */}
            <div className={loginStyles.formGroup}>
              <label htmlFor="institutionId" className={loginStyles.label}>
                {portalType === "CUSTOMER" ? "Email / Mobile No" : "Institution ID / Username"}
              </label>

              <div className={loginStyles.inputWrapper}>
                <FaUser className={loginStyles.inputIcon} />
                <input
                  type="text"
                  id="institutionId"
                  name="institutionId"
                  value={formData.institutionId}
                  onChange={handleChange}
                  placeholder={portalType === "CUSTOMER" ? "Enter email or mobile" : "Enter Institution ID"}
                  className={loginStyles.input}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className={loginStyles.formGroup}>
              <label htmlFor="password" className={loginStyles.label}>
                Password
              </label>

              <div className={loginStyles.inputWrapper}>
                <FaLock className={loginStyles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  className={loginStyles.input}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={loginStyles.passwordToggle}
                >
                  {showPassword ? (
                    <FaEyeSlash className={loginStyles.passwordIcon} />
                  ) : (
                    <FaEye className={loginStyles.passwordIcon} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className={loginStyles.loginButton}>
              Login to {portalType === "CUSTOMER" ? "Customer Portal" : portalType === "FIU" ? "FIU Portal" : "FIP Portal"}
            </button>
          </form>

          {/* Signup Switch for Customer */}
          {portalType === "CUSTOMER" && (
            <p className="text-center text-xs text-slate-600 mt-4">
              New Customer?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-green-700 font-bold hover:underline cursor-pointer"
              >
                Create Account & Link Bank
              </button>
            </p>
          )}

          {/* Information Box */}
          <div className={loginStyles.infoBox}>
            <div className={loginStyles.infoIconContainer}>
              <FaInfoCircle className={loginStyles.infoIcon} />
            </div>

            <div className={loginStyles.infoContent}>
              <p className={loginStyles.infoText}>
                ConsentChain Account Aggregator Platform.
              </p>
              <p className={loginStyles.infoTextSecondary}>
                Role: <span className="font-semibold text-purple-900">{portalType}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;