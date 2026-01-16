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

    const interval = setInterval(() => {
      loadStatistics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshStats = () => {
    loadStatistics();
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* No max-width wrapper → cards can expand fully next to sidebar */}
      <div className="pl-0 lg:pl-64"> {/* Offset by sidebar width on desktop only */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">BBIC Management Dashboard</h1>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mt-1">
                Principal's Overview
              </h2>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm whitespace-nowrap">
                Bela Bela, Limpopo | {new Date().getFullYear()} Session
              </div>
              <button
                onClick={refreshStats}
                disabled={loading}
                className="text-sm bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </header>

          {/* Statistics Cards - wider cards, no overflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 md:gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-7 border-l-4 border-emerald-500 flex flex-col justify-between min-h-[200px] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <div className="p-4 bg-emerald-100 rounded-xl">
                  <FaUserGraduate className="w-9 h-9 text-emerald-600" />
                </div>
                <span className="text-base font-medium text-gray-600">Students</span>
              </div>
              <div className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-2">
                {loading ? "..." : stats.totalLearners.toLocaleString()}
              </div>
              <div className="text-base text-gray-600 mb-4">Total Learners</div>
              <a href="/students" className="mt-auto text-emerald-600 hover:text-emerald-800 text-base font-medium flex items-center gap-2">
                View Students <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Teachers card */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-7 border-l-4 border-blue-500 flex flex-col justify-between min-h-[200px] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <div className="p-4 bg-blue-100 rounded-xl">
                  <FaChalkboardTeacher className="w-9 h-9 text-blue-600" />
                </div>
                <span className="text-base font-medium text-gray-600">Teachers</span>
              </div>
              <div className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-2">
                {loading ? "..." : stats.activeUstaads.toLocaleString()}
              </div>
              <div className="text-base text-gray-600 mb-4">Active Ustaads</div>
              <a href="/ustaads" className="mt-auto text-blue-600 hover:text-blue-800 text-base font-medium flex items-center gap-2">
                View Ustaads <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Adults card */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-7 border-l-4 border-purple-500 flex flex-col justify-between min-h-[200px] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <div className="p-4 bg-purple-100 rounded-xl">
                  <FaUsers className="w-9 h-9 text-purple-600" />
                </div>
                <span className="text-base font-medium text-gray-600">Adults</span>
              </div>
              <div className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-2">
                {loading ? "..." : stats.adultClasses.toLocaleString()}
              </div>
              <div className="text-base text-gray-600 mb-4">Adult Learners</div>
              <a href="/adult-classes" className="mt-auto text-purple-600 hover:text-purple-800 text-base font-medium flex items-center gap-2">
                View Adults <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Men card */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-7 border-l-4 border-indigo-500 flex flex-col justify-between min-h-[200px] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <div className="p-4 bg-indigo-100 rounded-xl">
                  <FaUserFriends className="w-9 h-9 text-indigo-600" />
                </div>
                <span className="text-base font-medium text-gray-600">Men</span>
              </div>
              <div className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-2">
                {loading ? "..." : stats.menList.toLocaleString()}
              </div>
              <div className="text-base text-gray-600 mb-4">B.B.I.C Men's List</div>
              <a href="/menlist" className="mt-auto text-indigo-600 hover:text-indigo-800 text-base font-medium flex items-center gap-2">
                View Men <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Excluded card */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-7 border-l-4 border-red-500 flex flex-col justify-between min-h-[200px] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <div className="p-4 bg-red-100 rounded-xl">
                  <FaUserMinus className="w-9 h-9 text-red-600" />
                </div>
                <span className="text-base font-medium text-gray-600">Excluded</span>
              </div>
              <div className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-2">
                {loading ? "..." : stats.excludedKids.toLocaleString()}
              </div>
              <div className="text-base text-gray-600 mb-4">Excluded Kids</div>
              <a href="/excluded-kids" className="mt-auto text-red-600 hover:text-red-800 text-base font-medium flex items-center gap-2">
                View Excluded <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Rest of your dashboard (Quick Statistics + Latest Activities + Links) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                <h3 className="text-xl font-bold text-gray-900">Quick Statistics</h3>
                <button
                  onClick={refreshStats}
                  disabled={loading}
                  className="text-sm bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-lg hover:bg-emerald-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-emerald-500"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading statistics...</p>
                </div>
              ) : (
                <div className="space-y-5 text-base">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-700">Total Classes</span>
                    <span className="font-bold text-gray-900">{stats.activeUstaads > 0 ? Math.ceil(stats.activeUstaads / 2) : 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-700">Avg Students per Class</span>
                    <span className="font-bold text-gray-900">
                      {stats.activeUstaads > 0 ? Math.round(stats.totalLearners / stats.activeUstaads) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-700">Exclusion Rate</span>
                    <span className="font-bold text-red-600">
                      {stats.totalLearners > 0
                        ? ((stats.excludedKids / (stats.totalLearners + stats.excludedKids)) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-700">Total Adult Members</span>
                    <span className="font-bold text-gray-900">{stats.adultClasses}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-700">Total Men's List Members</span>
                    <span className="font-bold text-gray-900">{stats.menList}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Active Members</span>
                    <span className="font-bold text-gray-900">
                      {stats.totalLearners + stats.adultClasses + stats.menList}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Latest Activities - kept your full list */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900">Latest Activities</h3>
                <span className="text-sm text-gray-600">Recent updates</span>
              </div>
              <ul className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                <li className="flex items-start p-4 bg-green-50 rounded-xl">
                  <span className="w-3.5 h-3.5 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <div>
                    <div className="font-semibold text-gray-900">Jalsa Completed</div>
                    <div className="text-sm text-gray-700 mt-1">Ext 6 Hall – 209 Certificates awarded to students.</div>
                    <div className="text-xs text-gray-500 mt-2">2 days ago</div>
                  </div>
                </li>
                <li className="flex items-start p-4 bg-blue-50 rounded-xl">
                  <span className="w-3.5 h-3.5 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <div>
                    <div className="font-semibold text-gray-900">Khatme-Quraan Completed</div>
                    <div className="text-sm text-gray-700 mt-1">25th Khatme-Quraan completed during Ramadhaan by adult learners.</div>
                    <div className="text-xs text-gray-500 mt-2">1 week ago</div>
                  </div>
                </li>
                <li className="flex items-start p-4 bg-yellow-50 rounded-xl">
                  <span className="w-3.5 h-3.5 bg-yellow-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <div>
                    <div className="font-semibold text-gray-900">Correctional Service Visit</div>
                    <div className="text-sm text-gray-700 mt-1">Visit to Modimolle Correctional Facility conducted by Ml A Lorgat.</div>
                    <div className="text-xs text-gray-500 mt-2">2 weeks ago</div>
                  </div>
                </li>
                {stats.excludedKids > 0 && (
                  <li className="flex items-start p-4 bg-red-50 rounded-xl">
                    <span className="w-3.5 h-3.5 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                    <div>
                      <div className="font-semibold text-gray-900">Student Exclusions</div>
                      <div className="text-sm text-gray-700 mt-1">
                        {stats.excludedKids} student{stats.excludedKids !== 1 ? 's have' : ' has'} been excluded. Review in Excluded Kids section.
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Ongoing</div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Quick Management Links - wider cards, no overflow */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Quick Management Links</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              <a
                href="/students"
                className="bg-emerald-50 hover:bg-emerald-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-emerald-700 font-semibold text-lg mb-3">Manage Students</div>
                <div className="text-sm text-gray-700">Add/Edit students</div>
              </a>
              <a
                href="/ustaads"
                className="bg-blue-50 hover:bg-blue-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-blue-700 font-semibold text-lg mb-3">Manage Ustaads</div>
                <div className="text-sm text-gray-700">Add/Edit teachers</div>
              </a>
              <a
                href="/adult-classes"
                className="bg-purple-50 hover:bg-purple-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-purple-700 font-semibold text-lg mb-3">Manage Adult Classes</div>
                <div className="text-sm text-gray-700">Add/Edit adult learners</div>
              </a>
              <a
                href="/menlist"
                className="bg-indigo-50 hover:bg-indigo-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-indigo-700 font-semibold text-lg mb-3">Manage Men's List</div>
                <div className="text-sm text-gray-700">Add/Edit men's list members</div>
              </a>
              <a
                href="/excluded-kids"
                className="bg-red-50 hover:bg-red-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-red-700 font-semibold text-lg mb-3">Excluded Kids</div>
                <div className="text-sm text-gray-700">Review exclusions</div>
              </a>
            </div>

            {/* Second row of links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-6">
              <a
                href="/dashboard/learners-summary"
                className="bg-gray-50 hover:bg-gray-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-gray-700 font-semibold text-lg mb-3">Students Summary</div>
                <div className="text-sm text-gray-600">View all students</div>
              </a>
              <a
                href="/dashboard/ustaads-summary"
                className="bg-gray-50 hover:bg-gray-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-gray-700 font-semibold text-lg mb-3">Ustaads Summary</div>
                <div className="text-sm text-gray-600">View all teachers</div>
              </a>
              <a
                href="/dashboard/adult-summary"
                className="bg-gray-50 hover:bg-gray-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-gray-700 font-semibold text-lg mb-3">Adult Summary</div>
                <div className="text-sm text-gray-600">View adult learners</div>
              </a>
              <a
                href="/dashboard/menlist-summary"
                className="bg-gray-50 hover:bg-gray-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-gray-700 font-semibold text-lg mb-3">Men's List Summary</div>
                <div className="text-sm text-gray-600">View all members</div>
              </a>
              <a
                href="/dashboard/learners-summary"
                className="bg-emerald-50 hover:bg-emerald-100 p-6 rounded-xl text-center transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-emerald-700 font-semibold text-lg mb-3">Overall Statistics</div>
                <div className="text-sm text-gray-600">Complete system overview</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;