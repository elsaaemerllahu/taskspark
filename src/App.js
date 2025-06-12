import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from 'react';
import Home from "./pages/Home";
import SignUp from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import ProtectedRoute from '../src/context/ProtectedRoute';
import About from "./pages/About/About";
import Profile from "./pages/Profile/Profile";
import MyTasks from "./pages/MyTasks/MyTasks";
import Reporting from "./pages/Reporting/Reporting";
import Goals from "./pages/Goals/Goals";

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>}
          />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/mytasks" element={
            <ProtectedRoute>
              <MyTasks />
            </ProtectedRoute>
          } />
          <Route path="/reporting" element={
            <ProtectedRoute>
              <Reporting />
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          } />
        </Routes>
    </Router>
  );
}

export default App;
