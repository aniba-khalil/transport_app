import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LoginSignup from "./components/LoginSignup";

import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginSignup />} />
      <Route path="/Dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
