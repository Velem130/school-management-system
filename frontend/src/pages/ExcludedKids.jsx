import { useEffect, useState } from "react";
import { excludedStudentApi, API_BASE_URL } from "../services/api";
import { FaSearch, FaFilter, FaRedo, FaUserCheck } from "react-icons/fa";

function ExcludedKids() {
  const [excludedThisYear, setExcludedThisYear] = useState([]);
  const [excludedLastYear, setExcludedLastYear] = useState([]);
  const [excludedTwoYearsAgo, setExcludedTwoYearsAgo] = useState([]);

  const [teachers, setTeachers] = useState([]);           
  const [ustaadhFilterOptions, setUstaadhFilterOptions] = useState([]); // NEW: unique teachers from exclusions

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

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Load active teachers (only for RESTORE modal)
        const teacherResponse = await fetch(`${API_BASE_URL}/teachers`);
        const allTeachers = await teacherResponse.json();
        setTeachers(allTeachers);

        // 2. Load all excluded students
        const allExcluded = await excludedStudentApi.getAllExcludedStudents();

        // NEW: Extract unique ustaadh names from excluded records for filter
        const uniqueUstaadhs = [...new Set(
          allExcluded
            .map(s => s.ustadh)
            .filter(name => name && name.trim() !== "") // skip empty/null
        )];
        setUstaadhFilterOptions(uniqueUstaadhs.sort()); // sort alphabetically

        // Split by year
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

  // Auto-set classTeaching when restoring
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
        classTeaching: restoreData.classTeaching,
      };

      const createResponse = await fetch(`${API_BASE_URL}/students?restore=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || "Failed to restore student");
      }

      await excludedStudentApi.deleteExcludedStudent(studentToRestore.id);

      // Refresh everything
      const allExcluded = await excludedStudentApi.getAllExcludedStudents();
      const thisYear = allExcluded.filter(s => new Date(s.excludedDate).getFullYear() === currentYear);
      const lastYear = allExcluded.filter(s => new Date(s.excludedDate).getFullYear() === currentYear - 1);
      const twoYearsAgo = allExcluded.filter(s => new Date(s.excludedDate).getFullYear() === currentYear - 2);

      setExcludedThisYear(thisYear);
      setExcludedLastYear(lastYear);
      setExcludedTwoYearsAgo(twoYearsAgo);

      // Refresh unique ustaadh options too
      const uniqueUstaadhs = [...new Set(
        allExcluded
          .map(s => s.ustadh)
          .filter(name => name && name.trim() !== "")
      )];
      setUstaadhFilterOptions(uniqueUstaadhs.sort());

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
    <div className="pt-10 pb-10 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Excluded Students</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Records are kept for 3 years. After that they are automatically removed.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm mb-6 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, ID, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 border rounded-lg text-sm md:text-base"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base"
          >
            <option value="all">All Classes</option>
            {/* You can populate unique classes later if needed */}
          </select>

          {/* Ustaadh filter - now uses unique names from excluded students */}
          <select
            value={filterUstadh}
            onChange={(e) => setFilterUstadh(e.target.value)}
            className="border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base"
          >
            <option value="all">All Ustaadhs</option>
            {ustaadhFilterOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterClass("all");
              setFilterUstadh("all");
            }}
            className="bg-gray-100 hover:bg-gray-200 px-4 md:px-6 py-2 rounded-lg font-medium text-sm md:text-base"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Three Sections */}
      <div className="space-y-8 md:space-y-12">
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 text-red-700">
            Excluded in {currentYear} ({filteredThisYear.length} students)
          </h2>
          <StudentTable students={filteredThisYear} onRestore={handleRestoreClick} />
        </div>

        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 text-orange-700">
            Excluded in {currentYear - 1} ({filteredLastYear.length} students)
          </h2>
          <StudentTable students={filteredLastYear} onRestore={handleRestoreClick} />
        </div>

        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 text-amber-700">
            Excluded in {currentYear - 2} ({filteredTwoYearsAgo.length} students)
          </h2>
          <StudentTable students={filteredTwoYearsAgo} onRestore={handleRestoreClick} />
        </div>
      </div>

      {/* Restore Modal - unchanged */}
      {showRestoreModal && studentToRestore && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl max-w-full md:max-w-lg w-full overflow-hidden mx-2 md:mx-auto">
            <div className="p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-emerald-700 mb-3 md:mb-4">Restore Student</h3>

              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-emerald-50 border border-emerald-200 rounded-lg md:rounded-xl">
                <div className="font-semibold text-emerald-800 text-sm md:text-base">Student Information:</div>
                <div className="mt-2 text-gray-700 text-sm md:text-base">
                  <strong>Name:</strong> {studentToRestore.name}
                </div>
                <div className="text-gray-700 text-sm md:text-base">
                  <strong>ID:</strong> {studentToRestore.studentId}
                </div>
                <div className="text-gray-700 text-sm md:text-base">
                  <strong>Original:</strong> {studentToRestore.ustadh} - {studentToRestore.classTeaching}
                </div>
              </div>

              <div className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Assign to Teacher *
                  </label>
                  <select
                    value={restoreData.ustadh}
                    onChange={(e) => setRestoreData({ ...restoreData, ustadh: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    New Class * (auto-set from teacher)
                  </label>
                  <input
                    type="text"
                    value={restoreData.classTeaching}
                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 text-gray-700 cursor-not-allowed text-sm md:text-base"
                    disabled
                  />
                </div>
              </div>

              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setStudentToRestore(null);
                  }}
                  className="px-4 md:px-6 py-2 md:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm md:text-base order-1 sm:order-2"
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

// StudentTable component remains unchanged
function StudentTable({ students, onRestore }) {
  if (students.length === 0) {
    return (
      <div className="bg-gray-50 p-6 md:p-12 text-center rounded-xl border border-gray-200">
        <p className="text-gray-500 text-base md:text-lg">No students in this period</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Student</th>
            <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Class Info</th>
            <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Exclusion Details</th>
            <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-red-50 transition-colors">
              <td className="px-3 md:px-6 py-3 md:py-5">
                <div className="font-medium text-gray-900 text-sm md:text-base">{student.name}</div>
                <div className="text-xs md:text-sm text-gray-600">ID: {student.studentId}</div>
              </td>
              <td className="px-3 md:px-6 py-3 md:py-5">
                <div className="font-medium text-sm md:text-base">Class: {student.classTeaching}</div>
                <div className="text-xs md:text-sm text-gray-600">Ustaadh: {student.ustadh}</div>
              </td>
              <td className="px-3 md:px-6 py-3 md:py-5">
                <div className="font-medium text-red-700 text-sm md:text-base">{student.reason}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">
                  {student.exclusionType?.replace("_", " ")} • {student.excludedDate}
                </div>
                {student.additionalNotes && (
                  <div className="text-xs md:text-sm mt-2 italic text-gray-600">
                    Note: {student.additionalNotes}
                  </div>
                )}
              </td>
              <td className="px-3 md:px-6 py-3 md:py-5">
                <button
                  onClick={() => onRestore(student)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 md:px-5 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 transition-colors w-full sm:w-auto justify-center"
                >
                  <FaUserCheck className="w-3 h-3 md:w-4 md:h-4" />
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