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

  const loadStatistics = async () => {
    setLoading(true);
    try {
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
      console.log("Some modules failed to load, using available data");

      try { const ustaads = await ustaadApi.getAll(); setStats(prev => ({ ...prev, activeUstaads: ustaads.length })); } catch (e) {}
      try { const students = await studentApi.getAllStudents(); setStats(prev => ({ ...prev, totalLearners: students.length })); } catch (e) {}
      try { const adultStudents = await adultStudentApi.getAllStudents(); setStats(prev => ({ ...prev, adultClasses: adultStudents.length })); } catch (e) {}
      try { const menStudents = await menStudentApi.getAllStudents(); setStats(prev => ({ ...prev, menList: menStudents.length })); } catch (e) {}
      try {
        const excludedStats = await excludedStudentApi.getStatistics();
        setStats(prev => ({ ...prev, excludedKids: excludedStats.totalExcluded || 0 }));
      } catch (e) {
        try {
          const excluded = await excludedStudentApi.getAllExcludedStudents();
          setStats(prev => ({ ...prev, excludedKids: excluded.length || 0 }));
        } catch (fallbackError) {
          setStats(prev => ({ ...prev, excludedKids: 0 }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
    const interval = setInterval(loadStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshStats = () => loadStatistics();

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Main content wrapper - limits max width and centers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">BBIC Management Dashboard</h1>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mt-1">
              Principal's Overview
            </h2>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg shadow-sm whitespace-nowrap">
              Bela Bela, Limpopo | {new Date().getFullYear()} Session
            </div>
            <button
              onClick={refreshStats}
              disabled={loading}
              className="text-sm bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 md:gap-6 mb-8">
          {/* Students */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <FaUserGraduate className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Students</span>
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-1">
              {loading ? "..." : stats.totalLearners.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">Total Learners</div>
            <a href="/students" className="mt-auto text-emerald-600 hover:text-emerald-800 text-sm font-medium">
              View Students →
            </a>
          </div>

          {/* Teachers */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaChalkboardTeacher className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Teachers</span>
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-1">
              {loading ? "..." : stats.activeUstaads.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">Active Ustaads</div>
            <a href="/ustaads" className="mt-auto text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Ustaads →
            </a>
          </div>

          {/* Adults */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUsers className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Adults</span>
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-1">
              {loading ? "..." : stats.adultClasses.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">Adult Learners</div>
            <a href="/adult-classes" className="mt-auto text-purple-600 hover:text-purple-800 text-sm font-medium">
              View Adults →
            </a>
          </div>

          {/* Men */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FaUserFriends className="w-7 h-7 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Men</span>
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-1">
              {loading ? "..." : stats.menList.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">B.B.I.C Men's List</div>
            <a href="/menlist" className="mt-auto text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View Men →
            </a>
          </div>

          {/* Excluded */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FaUserMinus className="w-7 h-7 text-red-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Excluded</span>
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-1">
              {loading ? "..." : stats.excludedKids.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">Excluded Kids</div>
            <a href="/excluded-kids" className="mt-auto text-red-600 hover:text-red-800 text-sm font-medium">
              View Excluded →
            </a>
          </div>
        </div>

        {/* Quick Stats + Latest Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Quick Statistics</h3>
              <button
                onClick={refreshStats}
                disabled={loading}
                className="text-xs text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                <p className="mt-3 text-gray-600">Loading...</p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Classes</span>
                  <span className="font-semibold">{stats.activeUstaads > 0 ? Math.ceil(stats.activeUstaads / 2) : 0}</span>
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
                  <span className="font-semibold">{stats.adultClasses}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Men's List Members</span>
                  <span className="font-semibold">{stats.menList}</span>
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

          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Latest Activities</h3>
              <span className="text-sm text-gray-500">Recent updates</span>
            </div>
            <ul className="space-y-4 max-h-80 overflow-y-auto pr-2">
              <li className="flex items-start p-4 bg-green-50 rounded-lg">
                <span className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                <div>
                  <div className="font-medium">Jalsa Completed</div>
                  <div className="text-sm text-gray-600 mt-1">Ext 6 Hall – 209 Certificates awarded to students.</div>
                  <div className="text-xs text-gray-500 mt-2">2 days ago</div>
                </div>
              </li>
              <li className="flex items-start p-4 bg-blue-50 rounded-lg">
                <span className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                <div>
                  <div className="font-medium">Khatme-Quraan Completed</div>
                  <div className="text-sm text-gray-600 mt-1">25th Khatme-Quraan completed during Ramadhaan by adult learners.</div>
                  <div className="text-xs text-gray-500 mt-2">1 week ago</div>
                </div>
              </li>
              {/* ... other activities ... */}
            </ul>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-6 text-gray-800">Quick Management Links</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <a href="/students" className="bg-emerald-50 hover:bg-emerald-100 p-5 rounded-lg text-center transition-colors flex flex-col items-center justify-center min-h-[120px]">
              <div className="text-emerald-600 font-semibold mb-2">Manage Students</div>
              <div className="text-sm text-gray-600">Add/Edit students</div>
            </a>
            {/* ... other links ... */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;