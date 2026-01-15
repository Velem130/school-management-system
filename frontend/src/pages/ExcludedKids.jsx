import { useEffect, useState } from "react";
import { excludedStudentApi } from "../services/api";
import { FaSearch, FaFilter, FaRedo, FaUserCheck } from "react-icons/fa";

function ExcludedKids() {
  const [excludedThisYear, setExcludedThisYear] = useState([]);
  const [excludedLastYear, setExcludedLastYear] = useState([]);
  const [excludedTwoYearsAgo, setExcludedTwoYearsAgo] = useState([]);

  const [teachers, setTeachers] = useState([]); // For restore modal
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [studentToRestore, setStudentToRestore] = useState(null);
  const [restoreData, setRestoreData] = useState({
    ustadh: "",
    classTeaching: "",
  });

  const [filterClass, setFilterClass] = useState("all");
  const [filterUstadh, setFilterUstadh] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  // Load teachers and excluded students
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load active teachers (adjust endpoint if different)
        const teacherResponse = await fetch("http://localhost:8080/api/teachers");
        const allTeachers = await teacherResponse.json();
        setTeachers(allTeachers);

        // Load all excluded
        const allExcluded = await excludedStudentApi.getAllExcludedStudents();

        const thisYear = allExcluded.filter(s => {
          const date = new Date(s.excludedDate);
          return date.getFullYear() === currentYear;
        });

        const lastYear = allExcluded.filter(s => {
          const date = new Date(s.excludedDate);
          return date.getFullYear() === currentYear - 1;
        });

        const twoYearsAgo = allExcluded.filter(s => {
          const date = new Date(s.excludedDate);
          return date.getFullYear() === currentYear - 2;
        });

        setExcludedThisYear(thisYear);
        setExcludedLastYear(lastYear);
        setExcludedTwoYearsAgo(twoYearsAgo);
      } catch (error) {
        console.error("Failed to load data:", error);
        alert("Failed to load excluded students or teachers");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // When teacher is selected, auto-set classTeaching from teacher's record
  useEffect(() => {
    if (restoreData.ustadh) {
      const selectedTeacher = teachers.find(t => t.name === restoreData.ustadh);
      if (selectedTeacher) {
        setRestoreData(prev => ({
          ...prev,
          classTeaching: selectedTeacher.classTeaching,
        }));
      }
    }
  }, [restoreData.ustadh, teachers]);

  const applyFilters = (list) => {
    return list.filter((student) => {
      const matchesClass = filterClass === "all" || student.classTeaching === filterClass;
      const matchesUstadh = filterUstadh === "all" || student.ustadh === filterUstadh;
      const matchesSearch =
        searchTerm === "" ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.includes(searchTerm) ||
        (student.reason && student.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesClass && matchesUstadh && matchesSearch;
    });
  };

  const filteredThisYear = applyFilters(excludedThisYear);
  const filteredLastYear = applyFilters(excludedLastYear);
  const filteredTwoYearsAgo = applyFilters(excludedTwoYearsAgo);

  const handleRestoreClick = (student) => {
    setStudentToRestore(student);
    setRestoreData({
      ustadh: student.ustadh || "",
      classTeaching: student.classTeaching || "",
    });
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    if (!restoreData.ustadh || !restoreData.classTeaching.trim()) {
      alert("Please select a teacher and enter a class name");
      return;
    }

    try {
      const studentData = {
        studentId: studentToRestore.studentId,
        name: studentToRestore.name,
        gender: studentToRestore.gender,
        dateJoined: studentToRestore.dateJoined,
        location: studentToRestore.location,
        madrassaLocation: studentToRestore.madrassaLocation,
        shoeSize: studentToRestore.shoeSize,
        cell: studentToRestore.cell,
        ustadh: restoreData.ustadh,
        classTeaching: restoreData.classTeaching, // Changed to classTeaching (match entity)
      };

      // Create active active student with restore flag
      const createResponse = await fetch("http://localhost:8080/api/students?restore=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || "Failed to restore student");
      }

      // Delete from excluded
      await excludedStudentApi.deleteExcludedStudent(studentToRestore.id);

      // Refresh lists
      const allExcluded = await excludedStudentApi.getAllExcludedStudents();
      const thisYear = allExcluded.filter(s => new Date(s.excludedDate).getFullYear() === currentYear);
      const lastYear = allExcluded.filter(s => new Date(s.excludedDate).getFullYear() === currentYear - 1);
      const twoYearsAgo = allExcluded.filter(s => new Date(s.excludedDate).getFullYear() === currentYear - 2);

      setExcludedThisYear(thisYear);
      setExcludedLastYear(lastYear);
      setExcludedTwoYearsAgo(twoYearsAgo);

      setShowRestoreModal(false);
      setStudentToRestore(null);

      alert(
        `Student ${studentToRestore.name} successfully restored to ${restoreData.ustadh} - ${restoreData.classTeaching}!`
      );
    } catch (error) {
      alert("Restore failed: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Excluded Students</h1>
          <p className="text-gray-600 mt-1">
            Records are kept for 3 years. After that they are automatically removed.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, ID, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Classes</option>
          </select>
          <select
            value={filterUstadh}
            onChange={(e) => setFilterUstadh(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Ustaadhs</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterClass("all");
              setFilterUstadh("all");
            }}
            className="bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-lg font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Three Sections */}
      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-red-700">
            Excluded in {currentYear} ({filteredThisYear.length} students)
          </h2>
          <StudentTable students={filteredThisYear} onRestore={handleRestoreClick} />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-orange-700">
            Excluded in {currentYear - 1} ({filteredLastYear.length} students)
          </h2>
          <StudentTable students={filteredLastYear} onRestore={handleRestoreClick} />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-amber-700">
            Excluded in {currentYear - 2} ({filteredTwoYearsAgo.length} students)
          </h2>
          <StudentTable students={filteredTwoYearsAgo} onRestore={handleRestoreClick} />
        </div>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && studentToRestore && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-emerald-700 mb-4">Restore Student</h3>

              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="font-semibold text-emerald-800">Student Information:</div>
                <div className="mt-2 text-gray-700">
                  <strong>Name:</strong> {studentToRestore.name}
                </div>
                <div className="text-gray-700">
                  <strong>ID:</strong> {studentToRestore.studentId}
                </div>
                <div className="text-gray-700">
                  <strong>Original:</strong> {studentToRestore.ustadh} - {studentToRestore.classTeaching}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Teacher *
                  </label>
                  <select
                    value={restoreData.ustadh}
                    onChange={(e) => setRestoreData({ ...restoreData, ustadh: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} - {t.classTeaching}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Class * (auto-set from teacher)
                  </label>
                  <input
                    type="text"
                    value={restoreData.classTeaching}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-700 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setStudentToRestore(null);
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Confirm & Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Table Component
function StudentTable({ students, onRestore }) {
  if (students.length === 0) {
    return (
      <div className="bg-gray-50 p-12 text-center rounded-xl border border-gray-200">
        <p className="text-gray-500 text-lg">No students in this period</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Class Info</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Exclusion Details</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-red-50 transition-colors">
              <td className="px-6 py-5">
                <div className="font-medium text-gray-900">{student.name}</div>
                <div className="text-sm text-gray-600">ID: {student.studentId}</div>
              </td>
              <td className="px-6 py-5">
                <div className="font-medium">Class: {student.classTeaching}</div>
                <div className="text-sm text-gray-600">Ustaadh: {student.ustadh}</div>
              </td>
              <td className="px-6 py-5">
                <div className="font-medium text-red-700">{student.reason}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {student.exclusionType?.replace("_", " ")} • {student.excludedDate}
                </div>
                {student.additionalNotes && (
                  <div className="text-sm mt-2 italic text-gray-600">
                    Note: {student.additionalNotes}
                  </div>
                )}
              </td>
              <td className="px-6 py-5">
                <button
                  onClick={() => onRestore(student)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <FaUserCheck />
                  Restore
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExcludedKids;