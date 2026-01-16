import { useEffect, useState } from "react";
import {
  ustaadApi,
  studentApi,
  adultStudentApi,
  menStudentApi,
  excludedStudentApi,
} from "../services/api";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaUserFriends,
  FaUserMinus,
} from "react-icons/fa";

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
      const [
        ustaads,
        students,
        adultStudents,
        menStudents,
        excludedStats,
      ] = await Promise.all([
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
      console.error(error);
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
    <div className="p-4 md:p-6 lg:p-0">
      {/* HEADER */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            BBIC Management Dashboard
          </h1>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mt-1">
            Principal's Overview
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
            Bela Bela, Limpopo | {new Date().getFullYear()}
          </div>
          <button
            onClick={loadStatistics}
            disabled={loading}
            className="text-sm bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 disabled:opacity-50 flex items-center"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        {[
          {
            title: "Total Learners",
            value: stats.totalLearners,
            icon: <FaUserGraduate />,
            color: "emerald",
          },
          {
            title: "Active Ustaads",
            value: stats.activeUstaads,
            icon: <FaChalkboardTeacher />,
            color: "blue",
          },
          {
            title: "Adult Learners",
            value: stats.adultClasses,
            icon: <FaUsers />,
            color: "purple",
          },
          {
            title: "Men's List",
            value: stats.menList,
            icon: <FaUserFriends />,
            color: "indigo",
          },
          {
            title: "Excluded Kids",
            value: stats.excludedKids,
            icon: <FaUserMinus />,
            color: "red",
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl shadow-sm p-4 lg:p-6 border-l-4 border-${card.color}-500`}
          >
            <div className="flex justify-between items-center mb-3">
              <div
                className={`p-3 bg-${card.color}-100 rounded-lg text-${card.color}-600`}
              >
                {card.icon}
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-800">
              {loading ? "..." : card.value}
            </div>
            <div className="text-sm text-gray-600">{card.title}</div>
          </div>
        ))}
      </div>

      {/* QUICK SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="font-bold mb-4">Quick Statistics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Total Classes</span>
              <span>{Math.ceil(stats.activeUstaads / 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Students</span>
              <span>
                {stats.activeUstaads
                  ? Math.round(stats.totalLearners / stats.activeUstaads)
                  : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 lg:col-span-2">
          <h3 className="font-bold mb-4">Latest Activities</h3>
          <ul className="space-y-3 text-sm">
            <li className="bg-green-50 p-3 rounded">
              Jalsa completed – 209 certificates issued
            </li>
            <li className="bg-blue-50 p-3 rounded">
              Khatme-Quraan completed
            </li>
          </ul>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h3 className="font-bold mb-4">Quick Management Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <a className="bg-emerald-50 p-4 rounded text-center">Students</a>
          <a className="bg-blue-50 p-4 rounded text-center">Ustaads</a>
          <a className="bg-purple-50 p-4 rounded text-center">Adults</a>
          <a className="bg-red-50 p-4 rounded text-center">Excluded</a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
