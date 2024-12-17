import React, { useState } from "react";
import axios from "axios";
import "../Login/login.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import loginMain from "../../Components/Assets/login_main.png";
import logo from "../../Components/Assets/logo.png";
import eyeSlash from "../../Components/Assets/eye-slash.png";
import eye from "../../Components/Assets/eye.png";
import toast, { Toaster } from "react-hot-toast";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:5000/api/user/reset-password/${token}`,
        {
          password,
        }
      );
      console.log(response.data);
      toast.success(response.data.message);
      setEmail("");
      setPassword("");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        console.error(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        console.error("Signup failed. Please try again.");
        toast.error("Signup failed. Please try again.");
      }
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
            <h3>Reset Password</h3>
            <p>Forgot your password? No problem, we are here to assist you!</p>
          </div>
          <div>
            <form onSubmit={handleSignup}>
              <div className="label-and-input">
                <label>
                  Email<span className="red-star">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="label-and-input">
                <label>
                  Password<span className="red-star">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                  {/* <img
                    src={showPassword ? eyeSlash : eye}
                    alt="toggle visibility"
                    className="toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  /> */}
                </div>
              </div>
              <div className="label-and-input">
                <label>
                  Confirm Password<span className="red-star">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                  />
                  {/* <img
                    src={showPassword ? eyeSlash : eye}
                    alt="toggle visibility"
                    className="toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  /> */}
                </div>
              </div>
              <button type="submit" className="change-password-button">
                Change Password
              </button>
            </form>
          </div>
          <div className="dont-have-an-account">
            <p className="dont-have-an-account-text">
              Don't have an account?{"  "}
              <Link to="/signup" className="signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
