import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ownerSignup.css";

function OwnerSignup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/register/owner",
        {
          firstName,
          lastName,
          email,
          password,
        }
      );
      console.log(response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token); // Store token
        setSuccess(response.data.message);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        navigate("/login"); // Navigate to dashboard
      } else {
        console.log(
          response.data.message || "Signup failed. Please try again."
        );
      }
    } catch (err) {
      console.log("Signup failed.");
      console.log("Error Occured: ", err);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSignup}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {success && <p style={{ color: "green" }}>{success}</p>}
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default OwnerSignup;
