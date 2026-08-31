import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen w-full relative z-0 scanlines">
        <Navigation />
        <main className="flex-1 overflow-x-hidden relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
