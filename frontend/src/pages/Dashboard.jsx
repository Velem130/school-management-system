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
    loadStatistics();  // Loads data only once when page loads
  }, []);

  const refreshStats = () => {
    loadStatistics();  // Manual refresh button still works
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        
        <header className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-8 gap-6 text-center sm:text-left">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">BBIC Management Dashboard</h1>
            <p className="text-lg sm:text-xl font-semibold text-gray-700 mt-1">
              Principal's Overview
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
              Bela Bela, Limpopo | {new Date().getFullYear()} Session
            </div>
            <button
              onClick={refreshStats}
              disabled={loading}
              className="w-full sm:w-auto text-sm bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 flex items-center justify-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          {/* Students Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <FaUserGraduate className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Students</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              {loading ? "..." : stats.totalLearners.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">Total Learners</div>
            <a href="/dashboard/learners-summary" className="text-emerald-600 hover:text-emerald-800 text-sm font-bold flex items-center gap-1">
              View Students Summary →
            </a>
          </div>

          {/* Teachers Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaChalkboardTeacher className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Teachers</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              {loading ? "..." : stats.activeUstaads.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">Active Ustaads</div>
            <a href="/dashboard/ustaads-summary" className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1">
              View Ustaads Summary →
            </a>
          </div>

          {/* Adults Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaUsers className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Adults</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              {loading ? "..." : stats.adultClasses.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">Adult Ladies</div>
            <a href="/dashboard/adult-summary" className="text-purple-600 hover:text-purple-800 text-sm font-bold flex items-center gap-1">
              View Adults Summary →
            </a>
          </div>

          {/* Men Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <FaUserFriends className="w-7 h-7 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Men</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              {loading ? "..." : stats.menList.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">B.B.I.C Men's List</div>
            <a href="/dashboard/menlist-summary" className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1">
              View Men Summary →
            </a>
          </div>

          {/* Excluded Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <FaUserMinus className="w-7 h-7 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Excluded</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              {loading ? "..." : stats.excludedKids.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">Excluded Kids</div>
            <a href="/excluded-kids" className="text-red-600 hover:text-red-800 text-sm font-bold flex items-center gap-1">
              View Excluded →
            </a>
          </div>
        </div>

        {/* Quick Statistics + Activities Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Statistics</h3>
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Total Classes", value: stats.activeUstaads > 0 ? Math.ceil(stats.activeUstaads / 2) : 0 },
                  { label: "Avg Students / Class", value: stats.activeUstaads > 0 ? Math.round(stats.totalLearners / stats.activeUstaads) : 0 },
                  { label: "Exclusion Rate", value: `${stats.totalLearners > 0 ? ((stats.excludedKids / (stats.totalLearners + stats.excludedKids)) * 100).toFixed(1) : 0}%`, color: "text-red-600" },
                  { label: "Active Members", value: stats.totalLearners + stats.adultClasses + stats.menList }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={`font-bold ${item.color || "text-gray-900"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Latest Activities</h3>
            <ul className="space-y-4">
              <li className="flex gap-4 p-4 bg-green-50 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-bold text-gray-900">Jalsa Completed</div>
                  <div className="text-sm text-gray-600">Ext 6 Hall – 209 Certificates awarded.</div>
                </div>
              </li>
              <li className="flex gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-bold text-gray-900">Khatme-Quraan</div>
                  <div className="text-sm text-gray-600">25th Khatme-Quraan completed.</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Links Grid */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Management Quick Links</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Students Summary", path: "/dashboard/learners-summary", bg: "bg-emerald-50", text: "text-emerald-700" },
              { label: "Ustaads Summary", path: "/dashboard/ustaads-summary", bg: "bg-blue-50", text: "text-blue-700" },
              { label: "Adults Summary", path: "/dashboard/adult-summary", bg: "bg-purple-50", text: "text-purple-700" },
              { label: "Men's List Summary", path: "/dashboard/menlist-summary", bg: "bg-indigo-50", text: "text-indigo-700" },
              { label: "Excluded Summary", path: "/excluded-kids", bg: "bg-red-50", text: "text-red-700" }
            ].map((link, idx) => (
              <a key={idx} href={link.path} className={`${link.bg} p-6 rounded-2xl text-center hover:scale-105 transition-transform`}>
                <div className={`${link.text} font-bold`}>{link.label}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;