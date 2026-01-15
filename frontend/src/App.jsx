import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Dashboard & summary pages
import Dashboard from "./pages/Dashboard";
import LearnersSummary from "./pages/LearnersSummary";
import UstaadsSummary from "./pages/UstaadsSummary";
import AdultSummary from "./pages/AdultSummary";
import MenListSummary from "./pages/MenListSummary";

// Full management pages
import Students from "./pages/Students";
import Ustaads from "./pages/Ustaads";
import AdultClasses from "./pages/AdultClasses";
import MenList from "./pages/MenList";
import ExcludedKids from "./pages/ExcludedKids"; // ADD THIS

function App() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="ml-64 flex-1 p-8">
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Summary routes (from dashboard cards) */}
          <Route path="/dashboard/learners-summary" element={<LearnersSummary />} />
          <Route path="/dashboard/ustaads-summary" element={<UstaadsSummary />} />
          <Route path="/dashboard/adult-summary" element={<AdultSummary />} />
          <Route path="/dashboard/menlist-summary" element={<MenListSummary />} />

          {/* Full management routes (from sidebar) */}
          <Route path="/students" element={<Students />} />
          <Route path="/ustaads" element={<Ustaads />} />
          <Route path="/adult-classes" element={<AdultClasses />} />
          <Route path="/menlist" element={<MenList />} />
          <Route path="/excluded-kids" element={<ExcludedKids />} /> {/* ADD THIS */}
        </Routes>
      </div>
    </div>
  );
}

export default App;





