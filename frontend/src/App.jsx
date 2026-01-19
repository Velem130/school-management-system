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
import ExcludedKids from "./pages/ExcludedKids"; 

function App() {
  return (
    /* This main wrapper now handles the side-by-side layout */
    <div className="bg-gray-50 min-h-screen flex flex-col lg:flex-row">
      
      {/* 1. The Sidebar (Stays on top for mobile, moves to left for laptop) */}
      <Sidebar />

      {/* 2. Main content (Takes up the remaining space on the right) */}
      <div className="flex-1 w-full overflow-x-hidden">
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
          <Route path="/excluded-kids" element={<ExcludedKids />} /> 
        </Routes>
      </div>
    </div>
  );
}

export default App;




