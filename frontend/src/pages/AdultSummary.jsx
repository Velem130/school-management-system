import { useEffect, useState } from "react";
import { adultStudentApi } from "../services/api";

function AdultSummary() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState("All Learners"); // New state for filter

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

  // Get unique teachers + special options
  const uniqueTeachers = ["All Learners", "Unassigned"];
  students.forEach(student => {
    if (student.ustadh && !uniqueTeachers.includes(student.ustadh)) {
      uniqueTeachers.push(student.ustadh);
    }
  });

  // Filter students: search + teacher filter
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      s.name?.toLowerCase().includes(search.toLowerCase());

    if (selectedTeacher === "All Learners") {
      return matchesSearch;
    }

    if (selectedTeacher === "Unassigned") {
      return matchesSearch && (!s.ustadh || s.ustadh.trim() === "" || s.ustadh.toLowerCase() === "n/a");
    }

    return matchesSearch && s.ustadh === selectedTeacher;
  });

  // Gender counts (based on filtered list)
  const totalMale = filteredStudents.filter((s) => s.gender === "Male").length;
  const totalFemale = filteredStudents.filter((s) => s.gender === "Female").length;

  return (
    <div className="pt-10 pb-10 px-4 md:px-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Adult Classes Summary</h1>

      {/* Search + Teacher Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 md:mb-6">
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full text-sm md:text-base"
        />
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="border p-2 rounded w-full text-sm md:text-base bg-white"
        >
          {uniqueTeachers.map((teacher) => (
            <option key={teacher} value={teacher}>
              {teacher === "All Learners" ? "All Learners" : 
               teacher === "Unassigned" ? "Unassigned / No Teacher" : 
               `Taught by: ${teacher}`}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <p className="text-gray-500 text-xs md:text-sm">Total Adult Learners</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-900">
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
        <h2 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">
          {selectedTeacher === "All Learners" ? "All Adult Learners" :
           selectedTeacher === "Unassigned" ? "Unassigned Adult Learners" :
           `Adult learners taught by ${selectedTeacher}`}
        </h2>
        
        {loading ? (
          <div className="text-center py-6 md:py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600 text-sm md:text-base">Loading adult students...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                        {search ? "No adult students found matching your search" : `No adult students found for "${selectedTeacher}"`}
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
                        <p className="text-sm text-gray-600">ID: {s.studentId}</p>
                      </div>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {s.gender}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 pt-2 border-t">
                      <p><span className="font-medium">Class:</span> {s.classTeaching}</p>
                      <p><span className="font-medium">Teacher:</span> {s.ustadh}</p>
                      <p><span className="font-medium">Location:</span> {s.location}</p>
                      <p><span className="font-medium">Cell:</span> {s.cell}</p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  {search ? "No adult students found matching your search" : `No adult students found for "${selectedTeacher}"`}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdultSummary;