import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { loginUser } from "../../redux/authSlice";
import "./login.css";
import loginMain from "../../Components/Assets/login_main.png";
import logo from "../../Components/Assets/logo.png";
import eye from "../../Components/Assets/eye.png";
import eyeSlash from "../../Components/Assets/eye-slash.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        toast.success("Login successful");
        navigate("/");
      })
      .catch((err) => {
        toast.error(err.message);
      });
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
            <h3>Sign in to Workhub</h3>
            <p className="login-text">
              Login to your account and start working. It's that simple!
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="label-and-input">
                <label>
                  Work Email<span className="red-star">*</span>
                </label>
                <div className="input-container">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              <div className="label-and-input">
                <label>
                  Password<span className="red-star">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                  <img
                    src={showPassword ? eyeSlash : eye}
                    alt="toggle visibility"
                    className="toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
              <div className="terms-and-conditions-div-login agree-to-terms">
                <div>
                  <input type="checkbox" className="checkbox-input" />
                  <label htmlFor="terms">Remember Me</label>
                </div>
                <div>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </Link>
                </div>
              </div>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
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
    </div>
  );
};

export default Login;
