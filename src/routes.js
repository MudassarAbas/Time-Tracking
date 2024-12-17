import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Signin from "../pages/signin";
import Signup from "../pages/signup";
import Dashboard from "./Pages/Dashboard/Dashboard";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Dashboard />} />
      <Route path="signin" element={<Signin />} />
      <Route path="signup" element={<Signup />} />
      <Route path="*" element={<h1>Page not found</h1>} />
    </Route>
  )
);
