import "./App.css";
import Login from "./Pages/Login/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Signup from "./Pages/Signup/Signup";
import Dashboard from "./Pages/Dashboard/Dashboard";
import OwnerSignup from "./Pages/Signup/OwnerSignup";
import Members from "./Pages/People-Members/Members";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import { useSelector } from "react-redux";
import Team from "./Pages/People-Team/Team";
import MemberManagement from "./Pages/MemberManagement/MemberManagement";
import TeamName from "./Pages/TeamName/TeamName";
import Layout from "./Components/Layout";
import ProjectsPage from "./Pages/ProjectsPage/ProjectsPage";
import ProjectDeailsPage from "./Pages/ProjectDeailsPage/ProjectDeailsPage";
import Timesheet from "./Pages/Timesheet/Timesheet";
import Screenshot from "./Pages/Screenshot/Screenshot";
import Calendar from "./Pages/Calendar/Calendar";

function App() {
  const isTokenValid = (token) => {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  };
  const { token } = useSelector((state) => state.auth);
  let tokenIsValid;
  if (token === null || undefined) {
    tokenIsValid = false;
    console.log("Token is null");
  } else {
    tokenIsValid = isTokenValid(token);
  }
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup/:token" element={<Signup />}></Route>
            <Route path="/signup/owner" element={<OwnerSignup />}></Route>
            <Route path="/forgot-password" element={<ForgotPassword />}></Route>
            <Route
              path="/reset-password/:token"
              element={<ResetPassword />}
            ></Route>
            <Route
              path="/"
              element={tokenIsValid ? <Dashboard /> : <Login />}
            ></Route>
            <Route
              path="/timesheet"
              element={tokenIsValid ? <Timesheet /> : <Login />}
            ></Route>
            <Route
              path="/people/members"
              element={tokenIsValid ? <Members /> : <Login />}
            ></Route>
            <Route
              path="/people/teams"
              element={tokenIsValid ? <Team /> : <Login />}
            ></Route>
            <Route
              path="/people/members/:id"
              element={tokenIsValid ? <MemberManagement /> : <Login />}
            ></Route>
            <Route
              path="/people/teams/:id"
              element={tokenIsValid ? <TeamName /> : <Login />}
            ></Route>
            <Route
              path="/calendar"
              element={tokenIsValid ? <Calendar /> : <Login />}
            ></Route>
            <Route path="/projects" element={<ProjectsPage />}></Route>
            <Route path="/projects/:id" element={<ProjectDeailsPage />}></Route>
            <Route path="/activity/screenshot" element={<Screenshot />}></Route>
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
