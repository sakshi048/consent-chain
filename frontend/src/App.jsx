import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import FipDashboard from "./pages/FipDashboard";
import FiuDashboard from "./pages/FiuDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import FiuCreateRequest from "./pages/FiuCreateRequest";
import FiuMyRequests from "./pages/FiuMyRequests";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/customer/dashboard" element={<CustomerDashboard />} />

        <Route path="/fip/dashboard" element={<FipDashboard />} />

        <Route path="/fiu/dashboard" element={<FiuDashboard />} />

        <Route path="/fiu/requests/create" element={<FiuCreateRequest />} />

        <Route path="/fiu/requests" element={<FiuMyRequests />} />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;