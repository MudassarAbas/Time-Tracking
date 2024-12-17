import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar"; // Adjust the import based on your structure

const Layout = ({ children }) => {
  const location = useLocation();
  const noNavbarPaths = [
    "/login",
    "/signup",
    "/signup/owner",
    "/forgot-password",
    "/reset-password",
  ];

  // Function to check if the current path matches any of the paths in noNavbarPaths
  const isNoNavbarPath = () => {
    return noNavbarPaths.some((path) => location.pathname.startsWith(path));
  };

  const showNavbar = !isNoNavbarPath();
  console.log(location.pathname);
  console.log(showNavbar);

  return (
    <div>
      {showNavbar && <Sidebar />}
      {children}
    </div>
  );
};

export default Layout;
