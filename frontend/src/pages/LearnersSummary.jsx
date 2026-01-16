import { useEffect, useState } from "react";
import { studentApi } from "../services/api";

function LearnersSummary() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Load students from database
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const data = await studentApi.getAllStudents();
        setStudents(data);
      } catch (error) {
        console.error("Failed to load students:", error);
        alert("Failed to load students from server.");
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
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Learners Summary</h1>

      {/* Search Input */}
      <div className="mb-4 md:mb-6">
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full text-sm md:text-base"
        />
      </div>

      {/* Summary Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-gray-500 text-xs md:text-sm">Total Learners</p>
          <p className="text-2xl md:text-3xl font-bold text-emerald-900">
            {loading ? "..." : filteredStudents.length}
          </p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-xs md:text-sm">Male Learners</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-900">
            {loading ? "..." : totalMale}
          </p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
          <p className="text-gray-500 text-xs md:text-sm">Female Learners</p>
          <p className="text-2xl md:text-3xl font-bold text-pink-900">
            {loading ? "..." : totalFemale}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h2 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">All Students</h2>
        
        {loading ? (
          <div className="text-center py-6 md:py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600 text-sm md:text-base">Loading students...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm min-w-[600px] border-collapse">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2 md:p-3 text-left">ID</th>
                  <th className="p-2 md:p-3 text-left">Name</th>
                  <th className="p-2 md:p-3 text-left">Gender</th>
                  <th className="p-2 md:p-3 text-left">Class</th>
                  <th className="p-2 md:p-3 text-left">Teacher</th>
                  <th className="p-2 md:p-3 text-left">Location</th>
                  <th className="p-2 md:p-3 text-left">Cell</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2 md:p-3">{s.studentId}</td>
                    <td className="p-2 md:p-3">{s.name}</td>
                    <td className="p-2 md:p-3">{s.gender}</td>
                    <td className="p-2 md:p-3">{s.classTeaching}</td>
                    <td className="p-2 md:p-3">{s.ustadh}</td>
                    <td className="p-2 md:p-3">{s.location}</td>
                    <td className="p-2 md:p-3">{s.cell}</td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500 text-sm">
                      {search ? "No students found matching your search" : "No students found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearnersSummary;

