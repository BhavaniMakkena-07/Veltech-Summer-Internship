import { Routes, Route } from "react-router-dom";
import Navbar    from "./components/Navbar";
import Upload    from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Findings  from "./pages/Findings";
import AIAnalysis from "./pages/AIAnalysis";
import History   from "./pages/History";
import Report    from "./pages/Report";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"               element={<Upload />} />
        <Route path="/dashboard/:id"  element={<Dashboard />} />
        <Route path="/findings/:id"   element={<Findings />} />
        <Route path="/analysis/:id"   element={<AIAnalysis />} />
        <Route path="/history"        element={<History />} />
        <Route path="/report/:id"     element={<Report />} />
      </Routes>
    </>
  );
}