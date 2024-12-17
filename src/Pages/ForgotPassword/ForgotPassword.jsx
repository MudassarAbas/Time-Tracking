import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import loginMain from "../../Components/Assets/login_main.png";
import logo from "../../Components/Assets/logo.png";
import "../Login/login.css";
import toast, { Toaster } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const forgotPasswordPromise = axios.post(
      "http://localhost:5000/api/user/forgot-password",
      { email }
    );

    toast.promise(forgotPasswordPromise, {
      loading: "Sending instructions...",
      success: (response) => {
        setEmail("");
        return response.data.message;
      },
      error: (error) => {
        return error.response.data.message || "An error occurred";
      },
    });

    try {
      await forgotPasswordPromise;
    } catch (error) {
      console.log(error.response || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="signup-container-left">
        <img src={loginMain} alt="login-main" className="login-main-image" />
      </div>
      <div className="signup-container-right">
        <div className="logo-container-div">
          <img src={logo} alt="" className="signup-logo" />
        </div>
        <div className="signup-container-form">
          <div>
            <h3>Forgot Password</h3>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="label-and-input">
                <label>
                  Work Email<span className="red-star">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              <button
                type="submit"
                className="send-instructions"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Instructions"}
              </button>
            </form>
            <div className="dont-have-an-account">
              <p className="dont-have-an-account-text">
                Need an account?{"  "}
                <Link to="/signup" className="signup-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
