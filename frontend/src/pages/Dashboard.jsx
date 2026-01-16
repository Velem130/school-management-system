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
      console.error("Stats Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
    const interval = setInterval(loadStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 md:p-8 pt-24 lg:pt-8"> 
      {/* pt-24 ensures content starts below the fixed mobile header */}
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">BBIC Dashboard</h1>
          <p className="text-lg font-medium text-gray-600">Principal's Overview</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={loadStatistics}
            disabled={loading}
            className="w-full sm:w-auto text-sm bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 flex items-center justify-center shadow-sm"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-6 mb-10">
        {[
          { label: "Students", count: stats.totalLearners, text: "Total Learners", icon: FaUserGraduate, color: "border-emerald-500", bg: "bg-emerald-100", textColor: "text-emerald-600", link: "/dashboard/learners-summary" },
          { label: "Teachers", count: stats.activeUstaads, text: "Active Ustaads", icon: FaChalkboardTeacher, color: "border-blue-500", bg: "bg-blue-100", textColor: "text-blue-600", link: "/dashboard/ustaads-summary" },
          { label: "Adults", count: stats.adultClasses, text: "Adult Learners", icon: FaUsers, color: "border-purple-500", bg: "bg-purple-100", textColor: "text-purple-600", link: "/dashboard/adult-summary" },
          { label: "Men", count: stats.menList, text: "B.B.I.C Men's List", icon: FaUserFriends, color: "border-indigo-500", bg: "bg-indigo-100", textColor: "text-indigo-600", link: "/dashboard/menlist-summary" },
          { label: "Excluded", count: stats.excludedKids, text: "Excluded Kids", icon: FaUserMinus, color: "border-red-500", bg: "bg-red-100", textColor: "text-red-600", link: "/excluded-kids" },
        ].map((card, idx) => (
          <div key={idx} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${card.color}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${card.bg} rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <span className="text-xs font-bold uppercase text-gray-400">{card.label}</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{loading ? "..." : card.count.toLocaleString()}</div>
            <div className="text-sm text-gray-500 font-medium mb-4">{card.text}</div>
            <a href={card.link} className={`text-sm font-semibold ${card.textColor}`}>View Details →</a>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">System Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-500">Avg Students/Class</span>
              <span className="font-bold">{stats.activeUstaads > 0 ? Math.round(stats.totalLearners / stats.activeUstaads) : 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500">Total Active</span>
              <span className="font-bold text-emerald-600">{stats.totalLearners + stats.adultClasses + stats.menList}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;