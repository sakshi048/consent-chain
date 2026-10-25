import { useState } from "react";
import {
    FaUniversity,
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaInfoCircle,
} from "react-icons/fa";

import { signupStyles } from "../assets/dummyStyles";

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        institutionId: "",
        password: "",
        confirmPassword: "",
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

        console.log("Signup Data:", formData);
    };

    return (
        <div className={signupStyles.container}>
            <div className={signupStyles.card}>
                <div className={signupStyles.header}>
                    <div className={signupStyles.logoContainer}>
                        <FaUniversity className={signupStyles.logoIcon} />
                    </div>

                    <h1 className={signupStyles.title}>HDFC BANK</h1>

                    <p className={signupStyles.subtitle}>FIP Portal</p>

                    <p className={signupStyles.description}>
                        Create your Financial Information Provider account
                    </p>
                </div>

                <div className={signupStyles.formContainer}>
                    <form onSubmit={handleSubmit} className={signupStyles.form}>
                        <div className={signupStyles.formGroup}>
                            <label htmlFor="name" className={signupStyles.label}>
                                Full Name
                            </label>

                            <div className={signupStyles.inputWrapper}>
                                <FaUser className={signupStyles.inputIcon} />

                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className={signupStyles.input}
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        <div className={signupStyles.formGroup}>
                            <label htmlFor="email" className={signupStyles.label}>
                                Email Address
                            </label>

                            <div className={signupStyles.inputWrapper}>
                                <FaEnvelope className={signupStyles.inputIcon} />

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={signupStyles.input}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className={signupStyles.formGroup}>
                            <label
                                htmlFor="institutionId"
                                className={signupStyles.label}
                            >
                                Institution ID
                            </label>

                            <div className={signupStyles.inputWrapper}>
                                <FaUniversity className={signupStyles.inputIcon} />

                                <input
                                    type="text"
                                    id="institutionId"
                                    name="institutionId"
                                    value={formData.institutionId}
                                    onChange={handleChange}
                                    placeholder="Enter institution ID"
                                    className={signupStyles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className={signupStyles.formGroup}>
                            <label htmlFor="password" className={signupStyles.label}>
                                Password
                            </label>

                            <div className={signupStyles.inputWrapper}>
                                <FaLock className={signupStyles.inputIcon} />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    className={signupStyles.input}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className={signupStyles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className={signupStyles.passwordIcon} />
                                    ) : (
                                        <FaEye className={signupStyles.passwordIcon} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={signupStyles.signupButton}>
                            Create Account
                        </button>
                    </form>

                    <p className={signupStyles.loginText}>
                        Already have an account?{" "}
                        <button type="button" className={signupStyles.loginLink}>
                            Sign In
                        </button>
                    </p>

                    <div className={signupStyles.infoBox}>
                        <div className={signupStyles.infoIconContainer}>
                            <FaInfoCircle className={signupStyles.infoIcon} />
                        </div>

                        <div className={signupStyles.infoContent}>
                            <p className={signupStyles.infoText}>
                                Create an account to access the FIP portal.
                            </p>

                            <p className={signupStyles.infoTextSecondary}>
                                This account is for FIP portal access only.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;