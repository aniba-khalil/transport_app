import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LoginSignup from "./components/LoginSignup";
import { UserProvider } from "./context/UserContext";
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </UserProvider>
  );
}

export default App;