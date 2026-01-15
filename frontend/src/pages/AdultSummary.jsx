import { useEffect, useState } from "react";
import { adultStudentApi } from "../services/api";

function AdultSummary() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Load adult students from database
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const data = await adultStudentApi.getAllStudents();
        setStudents(data);
      } catch (error) {
        console.error("Failed to load adult students:", error);
        alert("Failed to load adult students from server.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Filter students based on search (by ID or name)
  const filteredStudents = students.filter((s) =>
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Gender counts
  const totalMale = filteredStudents.filter((s) => s.gender === "Male").length;
  const totalFemale = filteredStudents.filter((s) => s.gender === "Female").length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Adult Classes Summary</h1>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {/* Summary Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Total Adult Learners</p>
          <p className="text-3xl font-bold text-purple-900">
            {loading ? "..." : filteredStudents.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Male Learners</p>
          <p className="text-3xl font-bold text-blue-900">
            {loading ? "..." : totalMale}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
          <p className="text-gray-500 text-sm">Female Learners</p>
          <p className="text-3xl font-bold text-pink-900">
            {loading ? "..." : totalFemale}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">All Adult Students</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600">Loading adult students...</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Gender</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Teacher</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Cell</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">{s.studentId}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.gender}</td>
                  <td className="p-3">{s.classTeaching}</td>
                  <td className="p-3">{s.ustadh}</td>
                  <td className="p-3">{s.location}</td>
                  <td className="p-3">{s.cell}</td>
                </tr>
              ))}
              {filteredStudents.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    {search ? "No adult students found matching your search" : "No adult students found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdultSummary;