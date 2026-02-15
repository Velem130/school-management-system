import { useEffect, useState } from "react";
import { menStudentApi } from "../services/api";

function MenListSummary() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Load men students from database
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const data = await menStudentApi.getAllStudents();
        setStudents(data);
      } catch (error) {
        console.error("Failed to load men students:", error);
        alert("Failed to load men students from server.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Filter students based on search (by name only now)
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Gender counts
  const totalMale = filteredStudents.filter((s) => s.gender === "Male").length;
  const totalFemale = filteredStudents.filter((s) => s.gender === "Female").length;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Men's List Summary</h1>

      {/* Search Input */}
      <div className="mb-4 md:mb-6">
        <input
          type="text"
          placeholder="Search by Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3 text-sm md:text-base"
        />
      </div>

      {/* Summary Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
          <p className="text-gray-500 text-xs md:text-sm">Total Members</p>
          <p className="text-2xl md:text-3xl font-bold text-indigo-900">
            {loading ? "..." : filteredStudents.length}
          </p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-xs md:text-sm">Male Members</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-900">
            {loading ? "..." : totalMale}
          </p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
          <p className="text-gray-500 text-xs md:text-sm">Female Members</p>
          <p className="text-2xl md:text-3xl font-bold text-pink-900">
            {loading ? "..." : totalFemale}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h2 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">All Members</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600 text-sm md:text-base">Loading members...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Gender</th>
                    <th className="p-3 text-left">Date Joined</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Cell</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="p-3">{s.name}</td>
                      <td className="p-3">{s.gender}</td>
                      <td className="p-3">{s.dateJoined}</td>
                      <td className="p-3">{s.location}</td>
                      <td className="p-3">{s.cell}</td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && !loading && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        {search ? "No members found matching your search" : "No members found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredStudents.map((s) => (
                <div key={s.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{s.name}</p>
                      </div>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                        {s.gender}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 pt-2 border-t">
                      <p><span className="font-medium">Joined:</span> {s.dateJoined}</p>
                      <p><span className="font-medium">Location:</span> {s.location}</p>
                      <p><span className="font-medium">Cell:</span> {s.cell}</p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  {search ? "No members found matching your search" : "No members found"}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MenListSummary;