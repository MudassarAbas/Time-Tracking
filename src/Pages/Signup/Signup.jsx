import React, { useState } from "react";
import axios from "axios";
import "../Login/login.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import loginMain from "../../Components/Assets/login_main.png";
import logo from "../../Components/Assets/logo.png";
import eye from "../../Components/Assets/eye.png";
import eyeSlash from "../../Components/Assets/eye-slash.png"; // Add eye-slash icon for toggling
import toast, { Toaster } from "react-hot-toast";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Password validation
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(password)) {
        toast.error(
          "Password must be at least 8 characters long and contain at least one letter and one number."
        );
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/user/register/${token}`,
        {
          firstName,
          lastName,
          email,
          password,
        }
      );
      console.log(response.data);
      toast.success(response.data.message);
      console.log("Signup successful! Please log in.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        console.error(`${err.response.data.message}`);
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
            <h3>Create New Account</h3>
            <p>
              Maximize productivity with real-time insights, automated
              timesheets, budget costing, and more.
            </p>
          </div>
          <div>
            <form onSubmit={handleSignup}>
              <div className="label-and-input">
                <label>
                  First Name<span className="red-star">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Enter your first name"
                />
              </div>
              <div className="label-and-input">
                <label>
                  Last Name<span className="red-star">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Enter your last name"
                />
              </div>
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="8 characters long and contain at least one letter and one number"
                  />
                  <img
                    src={showPassword ? eyeSlash : eye}
                    alt="toggle visibility"
                    className="toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
              <div className="terms-and-conditions-div">
                <input type="checkbox" required className="checkbox-input" />
                <label htmlFor="terms" className="agree-to-terms">
                  I agree to the{" "}
                  <Link to="/" className="privacy-policy">
                    Terms and Privacy Policy
                  </Link>
                </label>
              </div>
              <button type="submit">Create My Account</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
