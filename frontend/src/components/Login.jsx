import { useState } from "react";
import {
    FaUniversity,
    FaEye,
    FaEyeSlash,
    FaInfoCircle,
    FaLock,
    FaUser,
} from "react-icons/fa";
import { loginStyles } from "../assets/dummyStyles.js";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        institutionId: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Login Data:", formData);
    };

    return (
        <div className={loginStyles.container}>

            <div className={loginStyles.card}>

                {/* Header */}
                <div className={loginStyles.header}>

                    <div className={loginStyles.logoContainer}>
                        <FaUniversity className={loginStyles.logoIcon} />
                    </div>

                    <h1 className={loginStyles.title}>
                        HDFC BANK
                    </h1>

                    <p className={loginStyles.subtitle}>
                        FIP Portal
                    </p>

                    <p className="text-xs md:text-[13px] text-white/80 mt-1">
                        Financial Information Provider Portal
                    </p>

                </div>

                {/* Form */}
                <div className={loginStyles.formContainer}>

                    <form
                        onSubmit={handleSubmit}
                        className={loginStyles.form}
                    >

                        {/* Institution ID */}
                        <div className={loginStyles.formGroup}>

                            <label
                                htmlFor="institutionId"
                                className={loginStyles.label}
                            >
                                Institution ID / Username
                            </label>

                            <div className={loginStyles.inputWrapper}>

                                <FaUser className={loginStyles.inputIcon} />

                                <input
                                    type="text"
                                    id="institutionId"
                                    name="institutionId"
                                    value={formData.institutionId}
                                    onChange={handleChange}
                                    placeholder="Enter Institution ID"
                                    className={loginStyles.input}
                                    autoComplete="username"
                                />

                            </div>

                        </div>

                        {/* Password */}
                        <div className={loginStyles.formGroup}>

                            <label
                                htmlFor="password"
                                className={loginStyles.label}
                            >
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
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className={loginStyles.passwordToggle}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className={loginStyles.passwordIcon} />
                                    ) : (
                                        <FaEye className={loginStyles.passwordIcon} />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* Login */}
                        <button
                            type="submit"
                            className={loginStyles.loginButton}
                        >
                            Login
                        </button>

                    </form>

                    {/* Forgot Password */}
                    <button
                        type="button"
                        className={loginStyles.forgotPassword}
                    >
                        Forgot Password?
                    </button>

                    {/* Information */}
                    <div className={loginStyles.infoBox}>

                        <div className={loginStyles.infoIconContainer}>
                            <FaInfoCircle className={loginStyles.infoIcon} />
                        </div>

                        <div className={loginStyles.infoContent}>

                            <p className={loginStyles.infoText}>
                                This is the FIP portal login.
                            </p>

                            <p className={loginStyles.infoTextSecondary}>
                                This is{" "}
                                <span className={loginStyles.infoStrong}>
                                    NOT
                                </span>{" "}
                                customer internet banking login.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;