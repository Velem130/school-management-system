import { useEffect, useState } from "react";
import { ustaadApi, studentApi, adultStudentApi, menStudentApi, excludedStudentApi } from "../services/api";
import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaUserFriends, FaUserMinus } from "react-icons/fa";

function Dashboard() {
  const [stats, setStats] = useState({
    totalLearners: 0,
    activeUstaads: 0,
    adultClasses: 0,
    menList: 0,
    excludedKids: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load real data from backend
  const loadStatistics = async () => {
    setLoading(true);
    try {
      // Load all data in parallel for all modules
      const [ustaads, students, adultStudents, menStudents, excludedStats] = await Promise.all([
        ustaadApi.getAll(),
        studentApi.getAllStudents(),
        adultStudentApi.getAllStudents(),
        menStudentApi.getAllStudents(),
        excludedStudentApi.getStatistics(),
      ]);
     
      setStats({
        totalLearners: students.length,
        activeUstaads: ustaads.length,
        adultClasses: adultStudents.length,
        menList: menStudents.length,
        excludedKids: excludedStats.totalExcluded || 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard statistics:", error);
      // Don't show alert for individual module failures, just log
      console.log("Some modules failed to load, using available data");
     
      // Load data individually if parallel loading fails
      try {
        const ustaads = await ustaadApi.getAll();
        setStats(prev => ({ ...prev, activeUstaads: ustaads.length }));
      } catch (e) { console.log("Failed to load ustaads:", e); }
     
      try {
        const students = await studentApi.getAllStudents();
        setStats(prev => ({ ...prev, totalLearners: students.length }));
      } catch (e) { console.log("Failed to load students:", e); }
     
      try {
        const adultStudents = await adultStudentApi.getAllStudents();
        setStats(prev => ({ ...prev, adultClasses: adultStudents.length }));
      } catch (e) { console.log("Failed to load adult students:", e); }
     
      try {
        const menStudents = await menStudentApi.getAllStudents();
        setStats(prev => ({ ...prev, menList: menStudents.length }));
      } catch (e) { console.log("Failed to load men students:", e); }
     
      // Strengthened fallback for excluded - try stats first, then count all
      try {
        const excludedStats = await excludedStudentApi.getStatistics();
        setStats(prev => ({ ...prev, excludedKids: excludedStats.totalExcluded || 0 }));
      } catch (e) {
        console.log("Failed to load excluded stats, falling back to full count:", e);
        try {
          const excluded = await excludedStudentApi.getAllExcludedStudents();
          setStats(prev => ({ ...prev, excludedKids: excluded.length || 0 }));
        } catch (fallbackError) {
          console.log("Fallback excluded count also failed:", fallbackError);
          setStats(prev => ({ ...prev, excludedKids: 0 }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
   
    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      loadStatistics();
    }, 30000);
   
    return () => clearInterval(interval);
  }, []);

  // Function to refresh statistics manually
  const refreshStats = () => {
    loadStatistics();
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BBIC Management Dashboard</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-1">
            Principal's Overview
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
            Bela Bela, Limpopo | {new Date().getFullYear()} Session
          </div>
          <button
            onClick={refreshStats}
            disabled={loading}
            className="text-sm bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 disabled:opacity-50 flex items-center"
          >
            <svg className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>
      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Learners */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FaUserGraduate className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">Students</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {loading ? "..." : stats.totalLearners.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Learners</div>
          <a
            href="/dashboard/learners-summary"
            className="mt-4 inline-block text-emerald-600 hover:text-emerald-800 text-sm font-medium"
          >
            View Students →
          </a>
        </div>
        {/* Active Ustaads */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaChalkboardTeacher className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Teachers</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {loading ? "..." : stats.activeUstaads.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Active Ustaads</div>
          <a
            href="/dashboard/ustaads-summary"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Ustaads →
          </a>
        </div>
        {/* Adult Learners */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaUsers className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Adults</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {loading ? "..." : stats.adultClasses.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Adult Learners</div>
          <a
            href="/dashboard/adult-summary"
            className="mt-4 inline-block text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            View Adults →
          </a>
        </div>
        {/* Men's List */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FaUserFriends className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-500">Men</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {loading ? "..." : stats.menList.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">B.B.I.C Men's List</div>
          <a
            href="/dashboard/menlist-summary"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View Men →
          </a>
        </div>
        {/* Excluded Kids */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaUserMinus className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Excluded</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {loading ? "..." : stats.excludedKids.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Excluded Kids</div>
          <a
            href="/excluded-kids"
            className="mt-4 inline-block text-red-600 hover:text-red-800 text-sm font-medium"
          >
            View Excluded →
          </a>
        </div>
      </div>
      {/* Quick Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Quick Statistics</h3>
            <button
              onClick={refreshStats}
              className="text-xs text-emerald-600 hover:text-emerald-800"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
              <p className="mt-2 text-gray-600">Loading statistics...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Classes</span>
                <span className="font-semibold">
                  {stats.activeUstaads > 0 ? Math.ceil(stats.activeUstaads / 2) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Avg Students per Class</span>
                <span className="font-semibold">
                  {stats.activeUstaads > 0 ? Math.round(stats.totalLearners / stats.activeUstaads) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Exclusion Rate</span>
                <span className="font-semibold text-red-600">
                  {stats.totalLearners > 0
                    ? ((stats.excludedKids / (stats.totalLearners + stats.excludedKids)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Adult Members</span>
                <span className="font-semibold">
                  {stats.adultClasses}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Men's List Members</span>
                <span className="font-semibold">
                  {stats.menList}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Active Members</span>
                <span className="font-semibold">
                  {stats.totalLearners + stats.adultClasses + stats.menList}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Latest Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Latest Activities</h3>
            <span className="text-sm text-gray-500">Recent updates</span>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start p-3 bg-green-50 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <div>
                <div className="font-medium">Jalsa Completed</div>
                <div className="text-sm text-gray-600">Ext 6 Hall – 209 Certificates awarded to students.</div>
                <div className="text-xs text-gray-500 mt-1">2 days ago</div>
              </div>
            </li>
            <li className="flex items-start p-3 bg-blue-50 rounded-lg">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <div>
                <div className="font-medium">Khatme-Quraan Completed</div>
                <div className="text-sm text-gray-600">25th Khatme-Quraan completed during Ramadhaan by adult learners.</div>
                <div className="text-xs text-gray-500 mt-1">1 week ago</div>
              </div>
            </li>
            <li className="flex items-start p-3 bg-yellow-50 rounded-lg">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <div>
                <div className="font-medium">Correctional Service Visit</div>
                <div className="text-sm text-gray-600">Visit to Modimolle Correctional Facility conducted by Ml A Lorgat.</div>
                <div className="text-xs text-gray-500 mt-1">2 weeks ago</div>
              </div>
            </li>
            {stats.excludedKids > 0 && (
              <li className="flex items-start p-3 bg-red-50 rounded-lg">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <div className="font-medium">Student Exclusions</div>
                  <div className="text-sm text-gray-600">
                    {stats.excludedKids} student{stats.excludedKids !== 1 ? 's have' : ' has'} been excluded. Review in Excluded Kids section.
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Ongoing</div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* Quick Links Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-6 text-gray-800">Quick Management Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/students"
            className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-emerald-600 font-semibold">Manage Students</div>
            <div className="text-sm text-gray-600 mt-1">Add/Edit students</div>
          </a>
         
          <a
            href="/ustaads"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-blue-600 font-semibold">Manage Ustaads</div>
            <div className="text-sm text-gray-600 mt-1">Add/Edit teachers</div>
          </a>
         
          <a
            href="/adult-classes"
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-purple-600 font-semibold">Manage Adult Classes</div>
            <div className="text-sm text-gray-600 mt-1">Add/Edit adult learners</div>
          </a>
         
          <a
            href="/excluded-kids"
            className="bg-red-50 hover:bg-red-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-red-600 font-semibold">Excluded Kids</div>
            <div className="text-sm text-gray-600 mt-1">Review exclusions</div>
          </a>
        </div>
       
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <a
            href="/dashboard/learners-summary"
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-gray-600 font-semibold">Students Summary</div>
            <div className="text-sm text-gray-500 mt-1">View all students</div>
          </a>
         
          <a
            href="/dashboard/ustaads-summary"
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-gray-600 font-semibold">Ustaads Summary</div>
            <div className="text-sm text-gray-500 mt-1">View all teachers</div>
          </a>
         
          <a
            href="/dashboard/adult-summary"
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-gray-600 font-semibold">Adult Summary</div>
            <div className="text-sm text-gray-500 mt-1">View adult learners</div>
          </a>
         
          <a
            href="/dashboard/menlist-summary"
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-gray-600 font-semibold">Men's List Summary</div>
            <div className="text-sm text-gray-500 mt-1">View all members</div>
          </a>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <a
            href="/menlist"
            className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-indigo-600 font-semibold">Manage Men's List</div>
            <div className="text-sm text-gray-600 mt-1">Add/Edit men's list members</div>
          </a>
         
          <a
            href="/dashboard/learners-summary"
            className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-emerald-600 font-semibold">Overall Statistics</div>
            <div className="text-sm text-gray-600 mt-1">View complete system overview</div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;