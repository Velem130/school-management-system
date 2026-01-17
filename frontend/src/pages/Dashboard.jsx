import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
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
  /* ================= NAVBAR STATE ================= */
  const [isOpen, setIsOpen] = useState(false);
  const baseClass =
    "block px-4 py-2 rounded-md transition hover:bg-emerald-800";
  const activeClass = "bg-emerald-700 font-semibold";
  const toggleSidebar = () => setIsOpen(!isOpen);

  /* ================= DASHBOARD STATE ================= */
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
      const [ustaads, students, adultStudents, menStudents, excludedStats] =
        await Promise.all([
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
    <>
      {/* ================= NAVBAR ================= */}
      <header className="bg-emerald-900 text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4 md:px-6">
          <h1 className="font-bold text-lg">BBIC Management</h1>

          <nav className="hidden md:flex space-x-2">
            {[
              ["Dashboard", "/"],
              ["Student Roll", "/students"],
              ["Ustaads", "/ustaads"],
              ["Adult Classes", "/adult-classes"],
              ["Men's List", "/menlist"],
            ].map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `${baseClass} ${isActive ? activeClass : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <button onClick={toggleSidebar} className="md:hidden text-2xl">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col space-y-1 px-4 pb-4">
            {[
              ["Dashboard", "/"],
              ["Student Roll", "/students"],
              ["Ustaads", "/ustaads"],
              ["Adult Classes", "/adult-classes"],
              ["Men's List", "/menlist"],
            ].map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={baseClass}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* ================= DASHBOARD ================= */}
      <div className="bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            BBIC Management Dashboard
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-1">
            Principal's Overview
          </h2>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {[
            ["Students", stats.totalLearners, FaUserGraduate, "emerald"],
            ["Ustaads", stats.activeUstaads, FaChalkboardTeacher, "blue"],
            ["Adults", stats.adultClasses, FaUsers, "purple"],
            ["Men", stats.menList, FaUserFriends, "indigo"],
            ["Excluded", stats.excludedKids, FaUserMinus, "red"],
          ].map(([label, value, Icon, color]) => (
            <div
              key={label}
              className={`bg-white rounded-2xl shadow-md p-6 border-l-4 border-${color}-500`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 text-${color}-600`} />
                <span className="text-gray-600">{label}</span>
              </div>
              <div className="text-5xl font-extrabold text-gray-900">
                {loading ? "..." : value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Latest Activities */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Latest Activities</h3>
          <ul className="space-y-4">
            <li className="p-4 bg-green-50 rounded-xl">
              Jalsa completed – 209 certificates awarded
            </li>
            <li className="p-4 bg-blue-50 rounded-xl">
              Khatme-Quraan completed by adult learners
            </li>
            <li className="p-4 bg-yellow-50 rounded-xl">
              Correctional Service Visit conducted
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
